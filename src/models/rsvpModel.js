const Joi = require('joi');

const rsvpValidationSchema = Joi.object({
  // Datos del invitado principal
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),

  // Número de acompañantes
  numeroAcompañantes: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'El número de acompañantes debe ser un número válido'
    }),

  // Menú del invitado principal
  menu: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'La selección de menú es requerida',
      'string.min': 'El menú debe tener al menos 2 caracteres',
      'string.max': 'El menú no puede exceder 50 caracteres'
    }),

  // Opciones booleanas
  agregarAcompañantes: Joi.boolean().default(false),
  mismoPlato: Joi.boolean().default(false),

  // Array de acompañantes
  acompañantes: Joi.array().items(
    Joi.object({
      nombre: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.empty': 'El nombre del acompañante es requerido',
          'string.min': 'El nombre del acompañante debe tener al menos 2 caracteres'
        }),
      platillo: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'El platillo del acompañante es requerido',
          'string.min': 'El platillo debe tener al menos 2 caracteres',
          'string.max': 'El platillo no puede exceder 50 caracteres'
        })
    })
  ).default([]),

  // Alergias (opcional)
  alergias: Joi.string()
    .max(500)
    .allow('')
    .default('')
    .messages({
      'string.max': 'La descripción de alergias no puede exceder 500 caracteres'
    }),

  // Email del remitente (requerido para envío)
  emailRemitente: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debes proporcionar un email válido',
      'string.empty': 'El email es requerido'
    })
});

// Validación personalizada
const validateRsvpData = (data) => {
  const { error, value } = rsvpValidationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, data: null };
  }

  // Validaciones adicionales
  const numeroAcompañantes = parseInt(value.numeroAcompañantes);
  
  if (numeroAcompañantes > 0 && value.agregarAcompañantes) {
    if (value.acompañantes.length !== numeroAcompañantes) {
      return {
        isValid: false,
        errors: [{
          field: 'acompañantes',
          message: `Debes agregar exactamente ${numeroAcompañantes} acompañante(s)`
        }],
        data: null
      };
    }
  }

  return { isValid: true, errors: null, data: value };
};

module.exports = {
  validateRsvpData,
  rsvpValidationSchema
};
