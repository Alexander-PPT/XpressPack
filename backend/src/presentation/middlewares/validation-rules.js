const { body, validationResult } = require('express-validator');
const AppError = require('../../shared/utils/app-error');

/**
 * Reglas de validación para login
 */
const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres')
];

/**
 * Reglas de validación para creación de envío
 */
const createShipmentRules = [
  body('remitenteDni')
    .trim()
    .isLength({ min: 8, max: 8 })
    .isNumeric()
    .withMessage('DNI del remitente debe tener 8 dígitos'),
  body('remitenteNombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre del remitente es requerido'),
  body('remitenteEmail')
    .trim()
    .isEmail()
    .withMessage('Email del remitente inválido'),
  body('destinatarioDni')
    .trim()
    .isLength({ min: 8, max: 8 })
    .isNumeric()
    .withMessage('DNI del destinatario debe tener 8 dígitos'),
  body('destinatarioNombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre del destinatario es requerido'),
  body('destinatarioEmail')
    .trim()
    .isEmail()
    .withMessage('Email del destinatario inválido'),
  body('peso')
    .isFloat({ min: 0.1 })
    .withMessage('Peso debe ser mayor a 0'),
  body('tipoServicio')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Tipo de servicio es requerido'),
  body('sucursalOrigenId')
    .trim()
    .isUUID()
    .withMessage('ID de sucursal origen inválido'),
  body('sucursalDestinoId')
    .trim()
    .isUUID()
    .withMessage('ID de sucursal destino inválido')
];

/**
 * Reglas de validación para creación de usuario
 */
const createUserRules = [
  body('nombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre es requerido'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['ADMIN', 'OPERARIO'])
    .withMessage('Rol inválido'),
  body('sucursalId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('ID de sucursal inválido')
];

/**
 * Reglas de validación para actualización de usuario
 */
const updateUserRules = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre inválido'),
  body('rol')
    .optional()
    .isIn(['ADMIN', 'OPERARIO'])
    .withMessage('Rol inválido'),
  body('sucursalId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('ID de sucursal inválido'),
  body('estado')
    .optional()
    .isBoolean()
    .withMessage('Estado inválido')
];

/**
 * Reglas de validación para creación de sucursal
 */
const createSucursalRules = [
  body('nombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre de sucursal es requerido'),
  body('codigo')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Código de sucursal es requerido'),
  body('ciudad')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ciudad es requerida'),
  body('departamento')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Departamento es requerido'),
  body('direccion')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Dirección es requerida')
];

/**
 * Reglas de validación para actualización de sucursal
 */
const updateSucursalRules = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nombre inválido'),
  body('ciudad')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ciudad inválida'),
  body('departamento')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Departamento inválido'),
  body('direccion')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Dirección inválida'),
  body('estado')
    .optional()
    .isBoolean()
    .withMessage('Estado inválido')
];

/**
 * Middleware que valida las reglas y retorna errores si aplica
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

module.exports = {
  loginRules,
  createShipmentRules,
  createUserRules,
  updateUserRules,
  createSucursalRules,
  updateSucursalRules,
  validate
};
