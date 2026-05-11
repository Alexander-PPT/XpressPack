/**
 * Middleware de manejo de errores global
 * Debe ser el último middleware en la cadena
 */
const errorMiddleware = (err, req, res, next) => {
  // Errores operacionales (esperados)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR'
    });
  }

  // Errores de programación (no esperados)
  console.error('❌ Error no operacional:', err);

  // En producción, no revelar detalles
  const statusCode = process.env.NODE_ENV === 'development' ? 500 : 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
