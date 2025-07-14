const express = require('express');
const router = express.Router();
const { authenticate, authorizeArtist } = require('../middleware/auth');
const db = require('../config/database');

// Get artist statistics
router.get('/artist', authenticate, authorizeArtist, async (req, res) => {
  try {
    const artistId = req.user.id;
    
    // Get basic stats
    const [statsResults] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM proposals p 
         JOIN tattoo_artists ta ON p.artist_id = ta.id 
         WHERE ta.user_id = ?) as total_proposals,
        (SELECT COUNT(*) FROM proposals p 
         JOIN tattoo_artists ta ON p.artist_id = ta.id 
         WHERE ta.user_id = ? AND p.status = 'accepted') as accepted_proposals,
        (SELECT COUNT(*) FROM appointments a 
         JOIN tattoo_artists ta ON a.artist_id = ta.id 
         WHERE ta.user_id = ?) as total_appointments,
        (SELECT COUNT(*) FROM portfolio p 
         JOIN tattoo_artists ta ON p.artist_id = ta.id 
         WHERE ta.user_id = ?) as portfolio_items,
        (SELECT AVG(rating) FROM reviews r 
         JOIN tattoo_artists ta ON r.artist_id = ta.id 
         WHERE ta.user_id = ?) as average_rating
    `, [artistId, artistId, artistId, artistId, artistId]);
    
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
    
    // Get monthly stats for the last 6 months
    const [monthlyResults] = await db.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM proposals p
      JOIN tattoo_artists ta ON p.artist_id = ta.id
      WHERE ta.user_id = ? 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `, [artistId]);
    
    res.json({
      totalProposals: parseInt(stats.total_proposals) || 0,
      acceptedProposals: parseInt(stats.accepted_proposals) || 0,
      totalAppointments: parseInt(stats.total_appointments) || 0,
      portfolioItems: parseInt(stats.portfolio_items) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      acceptanceRate: parseFloat(acceptanceRate),
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
    const [results] = await db.execute(`
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
    
    res.json({
      totalArtists: parseInt(stats.total_artists) || 0,
      totalClients: parseInt(stats.total_clients) || 0,
      activeOffers: parseInt(stats.active_offers) || 0,
      pendingProposals: parseInt(stats.pending_proposals) || 0
    });
  } catch (error) {
    console.error('Get general stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

module.exports = router;