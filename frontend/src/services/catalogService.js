import api from './api';

const catalogService = {
  // Get tattoo styles
  getTattooStyles: async () => {
    try {
      const response = await api.get('/catalogs/tattoo-styles');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get tattoo styles error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener estilos de tatuaje'
      };
    }
  },

  // Get body parts
  getBodyParts: async () => {
    try {
      const response = await api.get('/catalogs/body-parts');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get body parts error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener partes del cuerpo'
      };
    }
  },

  // Get color types
  getColorTypes: async () => {
    try {
      const response = await api.get('/catalogs/color-types');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get color types error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener tipos de color'
      };
    }
  },

  // Get comunas (Chilean regions)
  getComunas: async () => {
    try {
      const response = await api.get('/catalogs/comunas');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get comunas error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener comunas'
      };
    }
  },

  // Get all catalog data at once
  getAllCatalogData: async () => {
    try {
      const [stylesResult, bodyPartsResult, colorTypesResult, comunasResult] = await Promise.all([
        catalogService.getTattooStyles(),
        catalogService.getBodyParts(),
        catalogService.getColorTypes(),
        catalogService.getComunas()
      ]);

      return {
        success: true,
        data: {
          styles: stylesResult.success ? stylesResult.data : [],
          bodyParts: bodyPartsResult.success ? bodyPartsResult.data : [],
          colorTypes: colorTypesResult.success ? colorTypesResult.data : [],
          comunas: comunasResult.success ? comunasResult.data : []
        }
      };
    } catch (error) {
      console.error('Get all catalog data error:', error);
      return {
        success: false,
        error: 'Error al obtener datos del catálogo'
      };
    }
  }
};

export default catalogService;