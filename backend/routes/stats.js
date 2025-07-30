const express = require('express');
const router = express.Router();
const { authenticate, authorizeArtist } = require('../middleware/auth');
const promisePool = require('../config/database');
const socketService = require('../services/socketService');

// Get client dashboard statistics
router.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

// Debug endpoint for socket status
router.get('/socket-debug', (req, res) => {
  res.json({
    connectedUsers: socketService.connectedUsers.size,
    artistsOnline: Array.from(socketService.artistsOnline),
    artistsOnlineCount: socketService.artistsOnline.size
  });
});

router.get('/client-dashboard', (req, res) => {
  res.json({
    onlineArtists: 12,
    newOffersToday: 4,
    avgResponseTime: 2
  });
});

// Get artist statistics
router.get('/artist', authenticate, authorizeArtist, async (req, res) => {
  try {
    const artistId = req.user.id;
    
    // First check if the artist profile exists
    const [artistCheck] = await promisePool.execute(
      'SELECT id FROM tattoo_artists WHERE user_id = ?',
      [artistId]
    );
    
    if (!artistCheck || artistCheck.length === 0) {
      // Return default stats if no artist profile exists
      return res.json({
        totalProposals: 0,
        acceptedProposals: 0,
        totalAppointments: 0,
        portfolioItems: 0,
        averageRating: 0,
        acceptanceRate: 0,
        monthlyStats: []
      });
    }
    
    // First get the artist's ID from tattoo_artists table
    const artistRecord = artistCheck[0];
    const tattooArtistId = artistRecord.id;
    
    // Get basic stats
    const [statsResults] = await promisePool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM proposals p WHERE p.artist_id = ?) as total_proposals,
        (SELECT COUNT(*) FROM proposals p WHERE p.artist_id = ? AND p.status = 'accepted') as accepted_proposals,
        (SELECT COUNT(*) FROM appointments a WHERE a.artist_id = ?) as total_appointments,
        (SELECT COUNT(*) FROM portfolio_images p WHERE p.artist_id = ?) as portfolio_items,
        (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.artist_id = ?) as average_rating
    `, [tattooArtistId, tattooArtistId, tattooArtistId, tattooArtistId, tattooArtistId]);
    
    const stats = statsResults[0] || {
      total_proposals: 0,
      accepted_proposals: 0,
      total_appointments: 0,
      portfolio_items: 0,
      average_rating: 0
    };
    
    // Calculate acceptance rate
    const acceptanceRate = stats.total_proposals > 0 
      ? (stats.accepted_proposals / stats.total_proposals * 100).toFixed(1)
      : 0;
    
    // Get next appointment
    const [nextAppointmentResult] = await promisePool.execute(`
      SELECT 
        a.id,
        a.title,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.client_name,
        a.status
      FROM appointments a
      WHERE a.artist_id = ? 
        AND a.appointment_date >= CURDATE()
        AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date ASC, a.start_time ASC
      LIMIT 1
    `, [tattooArtistId]);
    
    // Get recent activity stats
    const [recentActivity] = await promisePool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM appointments a 
         WHERE a.artist_id = ? AND a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_appointments,
        (SELECT COUNT(*) FROM proposals p 
         WHERE p.artist_id = ? AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_proposals
    `, [tattooArtistId, tattooArtistId]);
    
    // Get monthly stats for the last 6 months
    const [monthlyResults] = await promisePool.execute(`
      SELECT 
        DATE_FORMAT(p.created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM proposals p
      WHERE p.artist_id = ? 
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(p.created_at, '%Y-%m')
      ORDER BY month DESC
    `, [tattooArtistId]);
    
    const recentStats = recentActivity[0] || { recent_appointments: 0, recent_proposals: 0 };
    
    res.json({
      totalProposals: parseInt(stats.total_proposals) || 0,
      acceptedProposals: parseInt(stats.accepted_proposals) || 0,
      totalAppointments: parseInt(stats.total_appointments) || 0,
      portfolioItems: parseInt(stats.portfolio_items) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      acceptanceRate: parseFloat(acceptanceRate),
      nextAppointment: nextAppointmentResult.length > 0 ? nextAppointmentResult[0] : null,
      recentAppointments: parseInt(recentStats.recent_appointments) || 0,
      recentProposals: parseInt(recentStats.recent_proposals) || 0,
      monthlyStats: monthlyResults || []
    });
  } catch (error) {
    console.error('Get artist stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Get general statistics (public)
router.get('/general', async (req, res) => {
  try {
    const [results] = await promisePool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'artist' AND is_active = 1) as total_artists,
        (SELECT COUNT(*) FROM users WHERE user_type = 'client' AND is_active = 1) as total_clients,
        (SELECT COUNT(*) FROM tattoo_offers WHERE status = 'active') as active_offers,
        (SELECT COUNT(*) FROM proposals WHERE status = 'pending') as pending_proposals
    `);
    
    const stats = results[0] || {
      total_artists: 0,
      total_clients: 0,
      active_offers: 0,
      pending_proposals: 0
    };
    
    // Get real online artists count from socket service
    const onlineArtistsCount = socketService.artistsOnline.size;
    
    // Get today's new offers count
    const [todayOffersResult] = await promisePool.execute(`
      SELECT COUNT(*) as count
      FROM tattoo_offers
      WHERE DATE(created_at) = CURDATE()
    `);
    const newOffersToday = todayOffersResult[0]?.count || 0;
    
    // Add client dashboard stats
    const dashboardStats = {
      onlineArtists: onlineArtistsCount,
      newOffersToday: parseInt(newOffersToday),
      avgResponseTime: 2
    };
    
    res.json({
      totalArtists: parseInt(stats.total_artists) || 0,
      totalClients: parseInt(stats.total_clients) || 0,
      activeOffers: parseInt(stats.active_offers) || 0,
      pendingProposals: parseInt(stats.pending_proposals) || 0,
      dashboard: dashboardStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get general stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

module.exports = router;