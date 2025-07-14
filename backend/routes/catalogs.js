const express = require('express');
const router = express.Router();
const BodyPart = require('../models/BodyPart');
const TattooStyle = require('../models/TattooStyle');
const Comuna = require('../models/Comuna');
const { promisePool } = require('../config/database');

router.get('/body-parts', async (req, res) => {
  try {
    const bodyParts = await BodyPart.getAll();
    res.json(bodyParts);
  } catch (error) {
    console.error('Get body parts error:', error);
    res.status(500).json({ error: 'Error al obtener partes del cuerpo' });
  }
});

router.get('/tattoo-styles', async (req, res) => {
  try {
    const styles = await TattooStyle.getAll();
    res.json(styles);
  } catch (error) {
    console.error('Get tattoo styles error:', error);
    res.status(500).json({ error: 'Error al obtener estilos de tatuaje' });
  }
});

router.get('/comunas', async (req, res) => {
  try {
    const { region } = req.query;
    
    if (region) {
      const comunas = await Comuna.getByRegion(region);
      res.json(comunas);
    } else {
      const comunas = await Comuna.getGroupedByRegion();
      res.json(comunas);
    }
  } catch (error) {
    console.error('Get comunas error:', error);
    res.status(500).json({ error: 'Error al obtener comunas' });
  }
});

router.get('/regions', async (req, res) => {
  try {
    const regions = await Comuna.getRegions();
    res.json(regions);
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Error al obtener regiones' });
  }
});

router.get('/color-types', async (req, res) => {
  try {
    const [rows] = await promisePool.execute('SELECT * FROM color_types ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Get color types error:', error);
    res.status(500).json({ error: 'Error al obtener tipos de color' });
  }
});

module.exports = router;