/**
 * Middleware para rutas no encontradas
 */
const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.path} no encontrada`
  });
};

module.exports = notFoundMiddleware;
