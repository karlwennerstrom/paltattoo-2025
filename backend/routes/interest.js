const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorizeArtist } = require('../middleware/auth');
const socketService = require('../services/socketService');

// Express interest in an offer (quick action before formal proposal)
router.post('/:offerId', authenticate, authorizeArtist, async (req, res) => {
  try {
    const { offerId } = req.params;
    
    // Get the artist ID from tattoo_artists table using user_id
    const [artistRows] = await db.execute(
      'SELECT id FROM tattoo_artists WHERE user_id = ?',
      [req.user.id]
    );

    if (artistRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Perfil de artista no encontrado' 
      });
    }

    const artistId = artistRows[0].id;

    // Check if artist has already expressed interest
    const [existingInterest] = await db.execute(
      'SELECT id FROM offer_interests WHERE offer_id = ? AND artist_id = ?',
      [offerId, artistId]
    );

    if (existingInterest.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya has expresado interés en esta oferta' 
      });
    }

    // Add interest record
    await db.execute(
      'INSERT INTO offer_interests (offer_id, artist_id, created_at) VALUES (?, ?, NOW())',
      [offerId, artistId]
    );

    // Get offer details for notification
    const [offers] = await db.execute(
      'SELECT * FROM tattoo_offers WHERE id = ?',
      [offerId]
    );

    if (offers.length > 0) {
      const offer = offers[0];
      
      // Emit real-time notification to offer owner
      socketService.notifyOfferOwner(offerId, {
        type: 'artist_interested',
        artistId,
        message: 'Un tatuador está interesado en tu solicitud'
      });

      // Update interest count in Redis for real-time display
      await socketService.recordArtistInterest(offerId, artistId);
    }

    res.json({
      success: true,
      message: 'Interés expresado exitosamente'
    });

  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al expresar interés' 
    });
  }
});

// Get artists who expressed interest in an offer
router.get('/:offerId', authenticate, async (req, res) => {
  try {
    const { offerId } = req.params;

    const [interests] = await db.execute(`
      SELECT 
        oi.id,
        oi.created_at,
        ta.id as artist_id,
        u.name as artist_name,
        ta.profile_image,
        ta.studio_name,
        ta.experience_years
      FROM offer_interests oi
      JOIN tattoo_artists ta ON oi.artist_id = ta.id
      JOIN users u ON ta.user_id = u.id
      WHERE oi.offer_id = ?
      ORDER BY oi.created_at DESC
    `, [offerId]);

    res.json({
      success: true,
      data: interests
    });

  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener intereses' 
    });
  }
});

// Remove interest (if artist changes mind before sending proposal)
router.delete('/:offerId', authenticate, authorizeArtist, async (req, res) => {
  try {
    const { offerId } = req.params;
    
    // Get the artist ID from tattoo_artists table using user_id
    const [artistRows] = await db.execute(
      'SELECT id FROM tattoo_artists WHERE user_id = ?',
      [req.user.id]
    );

    if (artistRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Perfil de artista no encontrado' 
      });
    }

    const artistId = artistRows[0].id;

    await db.execute(
      'DELETE FROM offer_interests WHERE offer_id = ? AND artist_id = ?',
      [offerId, artistId]
    );

    res.json({
      success: true,
      message: 'Interés removido exitosamente'
    });

  } catch (error) {
    console.error('Remove interest error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al remover interés' 
    });
  }
});

module.exports = router;