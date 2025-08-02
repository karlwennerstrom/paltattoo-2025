const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const db = require('../config/database');
const axios = require('axios');

// Middleware para rutas administrativas
router.use(authenticate);
router.use(requireAdmin);

// Dashboard principal - métricas generales
router.get('/dashboard', async (req, res) => {
  try {
    // Métricas básicas
    const [statsResult] = await db.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.user_type = 'artist' THEN u.id END) as total_artists,
        COUNT(DISTINCT CASE WHEN u.user_type = 'client' THEN u.id END) as total_clients,
        COUNT(DISTINCT s.id) as total_subscriptions,
        COUNT(DISTINCT CASE WHEN s.status = 'authorized' THEN s.id END) as active_subscriptions,
        SUM(CASE WHEN s.status = 'authorized' THEN sp.price ELSE 0 END) as monthly_revenue
      FROM users u
      LEFT JOIN user_subscriptions s ON u.id = s.user_id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
    `);

    // Suscripciones por plan
    const [planStats] = await db.execute(`
      SELECT 
        sp.name as plan_name,
        sp.price,
        COUNT(s.id) as subscription_count,
        COUNT(CASE WHEN s.status = 'authorized' THEN 1 END) as active_count,
        SUM(CASE WHEN s.status = 'authorized' THEN sp.price ELSE 0 END) as plan_revenue
      FROM subscription_plans sp
      LEFT JOIN user_subscriptions s ON sp.id = s.plan_id
      WHERE sp.is_active = 1
      GROUP BY sp.id, sp.name, sp.price
      ORDER BY sp.price ASC
    `);

    // Actividad reciente (últimos 30 días)
    const [recentActivity] = await db.execute(`
      SELECT 
        DATE(s.created_at) as date,
        COUNT(s.id) as new_subscriptions,
        SUM(sp.price) as daily_revenue
      FROM user_subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(s.created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Pagos recientes
    const [recentPayments] = await db.execute(`
      SELECT 
        ph.*,
        u.email,
        up.first_name,
        sp.name as plan_name
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE ph.transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY ph.transaction_date DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: {
        stats: statsResult[0],
        planStats,
        recentActivity,
        recentPayments
      }
    });

  } catch (error) {
    console.error('Error getting admin dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard'
    });
  }
});

// Lista de todas las suscripciones
router.get('/subscriptions', async (req, res) => {
  try {
    const { status, plan, page = 1, limit = 50 } = req.query;
    
    // Asegurar que los parámetros de paginación sean números válidos
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 50;
    const offset = (parsedPage - 1) * parsedLimit;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('s.status = ?');
      params.push(status);
    }

    if (plan) {
      whereConditions.push('s.plan_id = ?');
      params.push(plan);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Construir consulta con valores directos
    const subscriptionQuery = `
      SELECT 
        s.*,
        u.email,
        up.first_name,
        up.last_name,
        u.user_type,
        sp.name as plan_name,
        sp.price,
        sp.plan_type,
        (SELECT COUNT(*) FROM payment_history ph WHERE ph.subscription_id = s.id) as payment_count,
        (SELECT ph.transaction_date FROM payment_history ph WHERE ph.subscription_id = s.id ORDER BY ph.transaction_date DESC LIMIT 1) as last_payment_date
      FROM user_subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;

    const [subscriptions] = await db.execute(subscriptionQuery, params);

    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripciones'
    });
  }
});

// Detalles de una suscripción específica
router.get('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Datos de la suscripción
    const [subscriptionResult] = await db.execute(`
      SELECT 
        s.*,
        u.email,
        up.first_name,
        up.last_name,
        u.user_type,
        u.created_at as user_created_at,
        sp.name as plan_name,
        sp.price,
        sp.plan_type,
        sp.features
      FROM user_subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.id = ?
    `, [id]);

    if (subscriptionResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    const subscription = subscriptionResult[0];

    // Historial de pagos
    const paymentHistory = await Subscription.getPaymentHistory(id);

    // Historial de cambios de plan
    const planChanges = await Subscription.getSubscriptionChanges(subscription.user_id);

    // Información de MercadoPago si existe
    let mercadopagoInfo = null;
    if (subscription.mercadopago_preapproval_id) {
      try {
        const response = await axios.get(
          `https://api.mercadopago.com/preapproval/${subscription.mercadopago_preapproval_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
          }
        );
        mercadopagoInfo = {
          id: response.data.id,
          status: response.data.status,
          next_payment_date: response.data.next_payment_date,
          last_modified: response.data.last_modified,
          payment_method_id: response.data.payment_method_id
        };
      } catch (error) {
        console.error('Error getting MercadoPago info:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        subscription,
        paymentHistory,
        planChanges,
        mercadopagoInfo
      }
    });

  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de la suscripción'
    });
  }
});

// Cancelar suscripción
router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Obtener suscripción
    const subscription = await Subscription.getById(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    // Cancelar en MercadoPago si existe preapproval ID
    if (subscription.mercadopago_preapproval_id) {
      try {
        await axios.put(
          `https://api.mercadopago.com/preapproval/${subscription.mercadopago_preapproval_id}`,
          { status: 'cancelled' },
          {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error cancelling in MercadoPago:', error.message);
      }
    }

    // Cancelar en nuestra base de datos
    await Subscription.cancel(id);

    // Registrar el cambio
    await Subscription.createSubscriptionChange({
      userId: subscription.user_id,
      oldPlanId: subscription.plan_id,
      newPlanId: null,
      changeType: 'cancel',
      changeReason: reason || 'Cancelación administrativa',
      effectiveDate: new Date().toISOString().split('T')[0],
      oldEndDate: subscription.end_date,
      newEndDate: new Date().toISOString().split('T')[0]
    });

    res.json({
      success: true,
      message: 'Suscripción cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la suscripción'
    });
  }
});

// Estadísticas de ingresos
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFormat, groupBy, dateFilter;
    
    switch (period) {
      case 'week':
        dateFormat = '%Y-%u';
        groupBy = 'YEARWEEK(ph.transaction_date)';
        dateFilter = 'ph.transaction_date >= DATE_SUB(NOW(), INTERVAL 12 WEEK)';
        break;
      case 'year':
        dateFormat = '%Y';
        groupBy = 'YEAR(ph.transaction_date)';
        dateFilter = 'ph.transaction_date >= DATE_SUB(NOW(), INTERVAL 3 YEAR)';
        break;
      default: // month
        dateFormat = '%Y-%m';
        groupBy = 'DATE_FORMAT(ph.transaction_date, "%Y-%m")';
        dateFilter = 'ph.transaction_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)';
    }

    const [revenueData] = await db.execute(`
      SELECT 
        DATE_FORMAT(ph.transaction_date, '${dateFormat}') as period,
        COUNT(ph.id) as transaction_count,
        SUM(ph.amount) as total_revenue,
        COUNT(DISTINCT ph.subscription_id) as unique_subscriptions
      FROM payment_history ph
      WHERE ${dateFilter} AND ph.status = 'approved'
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `);

    // Ingresos por plan
    const [revenueByPlan] = await db.execute(`
      SELECT 
        sp.name as plan_name,
        sp.price,
        COUNT(ph.id) as transaction_count,
        SUM(ph.amount) as total_revenue
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE ph.transaction_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        AND ph.status = 'approved'
      GROUP BY sp.id, sp.name, sp.price
      ORDER BY total_revenue DESC
    `);

    res.json({
      success: true,
      data: {
        revenueOverTime: revenueData,
        revenueByPlan
      }
    });

  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de ingresos'
    });
  }
});

// Lista de usuarios
router.get('/users', async (req, res) => {
  try {
    const { type, page = 1, limit = 50, search } = req.query;
    
    // Asegurar que los parámetros de paginación sean números válidos
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 50;
    const offset = (parsedPage - 1) * parsedLimit;

    let whereConditions = ['u.user_type != "admin"'];
    let params = [];

    if (type && ['artist', 'client'].includes(type)) {
      whereConditions.push('u.user_type = ?');
      params.push(type);
    }

    if (search) {
      whereConditions.push('(u.email LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Construir consulta con valores directos
    const userQuery = `
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        s.id as subscription_id,
        s.status as subscription_status,
        sp.name as plan_name,
        sp.price as plan_price,
        (SELECT COUNT(*) FROM payment_history ph 
         JOIN user_subscriptions us ON ph.subscription_id = us.id 
         WHERE us.user_id = u.id) as total_payments
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_subscriptions s ON u.id = s.user_id AND s.status = 'authorized'
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;

    const [users] = await db.execute(userQuery, params);

    // Parámetros para la consulta de conteo (sin limit y offset)  
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// Detalles de un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting user details for ID:', id);

    // Datos del usuario
    console.log('Executing user query...');
    const [userResult] = await db.execute(`
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        up.phone,
        up.bio,
        up.avatar_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `, [id]);

    console.log('User query completed, results:', userResult.length);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult[0];

    // Suscripción actual
    console.log('Executing subscription query...');
    const [subscriptionResult] = await db.execute(`
      SELECT 
        s.*,
        sp.name as plan_name,
        sp.price,
        sp.plan_type,
        sp.features
      FROM user_subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ? AND s.status = 'authorized'
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [id]);

    console.log('Subscription query completed');

    // Historial de pagos
    console.log('Executing payment history query...');
    const [paymentHistory] = await db.execute(`
      SELECT 
        ph.*,
        sp.name as plan_name
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ?
      ORDER BY ph.transaction_date DESC
      LIMIT 10
    `, [id]);

    console.log('Payment history query completed');

    res.json({
      success: true,
      data: {
        user,
        subscription: subscriptionResult[0] || null,
        paymentHistory
      }
    });

  } catch (error) {
    console.error('Error getting user details:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del usuario',
      error: error.message
    });
  }
});

// Cambiar estado del usuario
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const [result] = await db.execute(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Usuario ${status === 'active' ? 'activado' : 'suspendido'} exitosamente`
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del usuario'
    });
  }
});

// Lista de ofertas de tatuajes
router.get('/offers', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    // Asegurar que los parámetros de paginación sean números válidos
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    const offset = (parsedPage - 1) * parsedLimit;
    
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(o.title LIKE ? OR o.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Construir la consulta con valores directos
    const query = `
      SELECT 
        o.*,
        u.email as user_email,
        up.first_name as user_name,
        bp.name as body_part,
        ts.name as style,
        ct.name as color_type,
        (SELECT COUNT(*) FROM proposals p WHERE p.offer_id = o.id) as proposal_count
      FROM tattoo_offers o
      JOIN users u ON o.client_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN body_parts bp ON o.body_part_id = bp.id
      LEFT JOIN tattoo_styles ts ON o.style_id = ts.id
      LEFT JOIN color_types ct ON o.color_type_id = ct.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;

    const [offers] = await db.execute(query, params);

    // Parámetros para la consulta de conteo (sin limit y offset)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tattoo_offers o
      JOIN users u ON o.client_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);

    res.json({
      success: true,
      data: {
        offers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas'
    });
  }
});

// Detalles de una oferta específica
router.get('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Datos de la oferta
    const [offerResult] = await db.execute(`
      SELECT 
        o.*,
        u.email as user_email,
        up.first_name,
        up.last_name,
        u.user_type,
        u.created_at as user_created_at,
        bp.name as body_part,
        ts.name as style,
        ct.name as color_type
      FROM tattoo_offers o
      JOIN users u ON o.client_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN body_parts bp ON o.body_part_id = bp.id
      LEFT JOIN tattoo_styles ts ON o.style_id = ts.id
      LEFT JOIN color_types ct ON o.color_type_id = ct.id
      WHERE o.id = ?
    `, [id]);

    if (offerResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    const offer = offerResult[0];

    // Imágenes de referencia
    const [referenceImages] = await db.execute(`
      SELECT * FROM offer_references
      WHERE offer_id = ?
      ORDER BY created_at ASC
    `, [id]);

    // Propuestas
    const [proposals] = await db.execute(`
      SELECT 
        p.*,
        ta.user_id as artist_user_id,
        up.first_name as artist_name
      FROM proposals p
      JOIN tattoo_artists ta ON p.artist_id = ta.id
      JOIN users u ON ta.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE p.offer_id = ?
      ORDER BY p.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        offer,
        user: {
          id: offer.user_id,
          email: offer.user_email,
          first_name: offer.first_name,
          last_name: offer.last_name,
          user_type: offer.user_type,
          created_at: offer.user_created_at
        },
        referenceImages,
        proposals
      }
    });

  } catch (error) {
    console.error('Error getting offer details:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de la oferta'
    });
  }
});

// Eliminar una oferta
router.delete('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la oferta existe
    const [offerCheck] = await db.execute(
      'SELECT id FROM tattoo_offers WHERE id = ?',
      [id]
    );

    if (offerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }

    // Eliminar la oferta (las propuestas e imágenes se eliminan en cascada)
    await db.execute('DELETE FROM tattoo_offers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Oferta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la oferta'
    });
  }
});

// NOTA: Las rutas de tiendas devuelven datos vacíos porque la tabla 'shops' no existe en el esquema actual

// Lista de tiendas
router.get('/shops', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    // Asegurar que los parámetros de paginación sean números válidos
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    const offset = (parsedPage - 1) * parsedLimit;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('ss.is_active = ?');
      params.push(status === 'active' ? 1 : 0);
    }

    if (search) {
      whereConditions.push('(ss.name LIKE ? OR ss.city LIKE ? OR ss.category LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ss.*,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as total_reviews
      FROM sponsored_shops ss
      LEFT JOIN shop_reviews r ON ss.id = r.shop_id
      ${whereClause}
      GROUP BY ss.id
      ORDER BY ss.is_featured DESC, ss.created_at DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;

    const [shops] = await db.execute(query, params);

    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sponsored_shops ss
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        shops,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tiendas'
    });
  }
});

// Detalles de una tienda específica
router.get('/shops/:id', async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Tienda no encontrada'
  });
});

// Cambiar estado de la tienda
router.patch('/shops/:id/status', async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Tienda no encontrada'
  });
});

// Verificar/desverificar tienda
router.patch('/shops/:id/verify', async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Tienda no encontrada'
  });
});

// Eliminar una tienda
router.delete('/shops/:id', async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Tienda no encontrada'
  });
});

// Lista de pagos
router.get('/payments', async (req, res) => {
  try {
    const { status, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;
    
    // Asegurar que los parámetros de paginación sean números válidos
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 20;
    const offset = (parsedPage - 1) * parsedLimit;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('ph.status = ?');
      params.push(status);
    }

    if (dateFrom) {
      whereConditions.push('ph.transaction_date >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push('ph.transaction_date <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (search) {
      whereConditions.push('(u.email LIKE ? OR ph.mercadopago_payment_id LIKE ? OR ph.transaction_id LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Construir consulta con valores directos
    const paymentQuery = `
      SELECT 
        ph.*,
        u.email as user_email,
        up.first_name as user_name,
        sp.name as plan_name,
        s.id as subscription_id
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
      ORDER BY ph.transaction_date DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `;

    const [payments] = await db.execute(paymentQuery, params);

    // Parámetros para la consulta de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, params);

    // Calcular resumen
    const [summaryResult] = await db.execute(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(ph.amount) as totalAmount,
        AVG(ph.amount) as averageAmount
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      ${whereClause}
      AND ph.status = 'approved'
    `, countParams);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        },
        summary: {
          totalPayments: summaryResult[0].totalPayments || 0,
          totalAmount: summaryResult[0].totalAmount || 0,
          averageAmount: summaryResult[0].averageAmount || 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
});

// Detalles de un pago específico
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Datos del pago
    const [paymentResult] = await db.execute(`
      SELECT 
        ph.*,
        s.id as subscription_id,
        s.status as subscription_status,
        s.mercadopago_preapproval_id,
        sp.name as plan_name,
        sp.plan_type,
        u.id as user_id,
        u.email,
        u.user_type,
        up.first_name,
        up.last_name
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ph.id = ?
    `, [id]);

    if (paymentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const payment = paymentResult[0];

    // Información de MercadoPago si existe
    let mercadopagoInfo = null;
    if (payment.mercadopago_payment_id) {
      try {
        const response = await axios.get(
          `https://api.mercadopago.com/v1/payments/${payment.mercadopago_payment_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
          }
        );
        mercadopagoInfo = {
          id: response.data.id,
          status: response.data.status,
          operation_type: response.data.operation_type,
          description: response.data.description,
          payment_type_id: response.data.payment_type_id,
          payment_method_id: response.data.payment_method_id
        };
      } catch (error) {
        console.error('Error getting MercadoPago info:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        payment,
        user: {
          id: payment.user_id,
          email: payment.email,
          first_name: payment.first_name,
          last_name: payment.last_name,
          user_type: payment.user_type
        },
        subscription: {
          id: payment.subscription_id,
          status: payment.subscription_status,
          plan_name: payment.plan_name,
          plan_type: payment.plan_type
        },
        mercadopagoInfo
      }
    });

  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del pago'
    });
  }
});

// Reembolsar un pago
router.post('/payments/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del pago
    const [paymentResult] = await db.execute(
      'SELECT * FROM payment_history WHERE id = ?',
      [id]
    );

    if (paymentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const payment = paymentResult[0];

    if (payment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reembolsar pagos aprobados'
      });
    }

    if (payment.refunded_at) {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya fue reembolsado'
      });
    }

    // Procesar reembolso en MercadoPago
    if (payment.mercadopago_payment_id) {
      try {
        await axios.post(
          `https://api.mercadopago.com/v1/payments/${payment.mercadopago_payment_id}/refunds`,
          { amount: payment.amount },
          {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error processing refund in MercadoPago:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Error al procesar el reembolso en MercadoPago'
        });
      }
    }

    // Actualizar estado del pago
    await db.execute(
      'UPDATE payment_history SET status = ?, refunded_at = NOW(), refund_amount = ? WHERE id = ?',
      ['refunded', payment.amount, id]
    );

    res.json({
      success: true,
      message: 'Pago reembolsado exitosamente'
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el reembolso'
    });
  }
});

// Exportar pagos a CSV
router.get('/payments/export', async (req, res) => {
  try {
    const { status, dateFrom, dateTo, search } = req.query;

    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('ph.status = ?');
      params.push(status);
    }

    if (dateFrom) {
      whereConditions.push('ph.transaction_date >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push('ph.transaction_date <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (search) {
      whereConditions.push('(u.email LIKE ? OR ph.mercadopago_payment_id LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const [payments] = await db.execute(`
      SELECT 
        ph.transaction_id,
        ph.mercadopago_payment_id,
        u.email,
        up.first_name,
        up.last_name,
        sp.name as plan_name,
        ph.amount,
        ph.status,
        ph.payment_method,
        ph.transaction_date,
        ph.refunded_at,
        ph.refund_amount
      FROM payment_history ph
      JOIN user_subscriptions s ON ph.subscription_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ${whereClause}
      ORDER BY ph.transaction_date DESC
    `, params);

    // Crear CSV
    const csvHeaders = [
      'ID Transacción',
      'ID MercadoPago',
      'Email',
      'Nombre',
      'Apellido',
      'Plan',
      'Monto',
      'Estado',
      'Método de Pago',
      'Fecha',
      'Fecha Reembolso',
      'Monto Reembolsado'
    ].join(',');

    const csvRows = payments.map(payment => [
      payment.transaction_id || '',
      payment.mercadopago_payment_id || '',
      payment.email,
      payment.first_name || '',
      payment.last_name || '',
      payment.plan_name,
      payment.amount,
      payment.status,
      payment.payment_method || 'MercadoPago',
      payment.transaction_date,
      payment.refunded_at || '',
      payment.refund_amount || ''
    ].join(','));

    const csv = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pagos_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar pagos'
    });
  }
});

module.exports = router;