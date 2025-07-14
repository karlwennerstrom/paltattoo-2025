const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }
  
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Referencia inválida' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'El archivo es demasiado grande' });
  }
  
  if (err.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: 'Solo se permiten archivos de imagen' });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
};

module.exports = {
  errorHandler,
  notFound
};