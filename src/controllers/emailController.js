const emailService = require('../services/emailService');
const { validateRsvpData } = require('../models/rsvpModel');
const { createSuccessResponse, createErrorResponse } = require('../utils/responseHelper');

class EmailController {
  /**
   * Envía confirmación de RSVP
   */
  async sendRsvpConfirmation(req, res) {
    try {
      // Validar datos de entrada
      const { isValid, errors, data } = validateRsvpData(req.body);
      
      if (!isValid) {
        return res.status(400).json(
          createErrorResponse('Datos de validación incorrectos', errors, 'VALIDATION_ERROR')
        );
      }

      // Enviar email
      const result = await emailService.sendRsvpConfirmation(data);

      if (result.success) {
        return res.status(200).json(
          createSuccessResponse(
            'Confirmación enviada exitosamente',
            {
              messageId: result.messageId,
              recipient: data.emailRemitente,
              timestamp: new Date().toISOString()
            }
          )
        );
      } else {
        return res.status(500).json(
          createErrorResponse(
            'Error enviando confirmación',
            result.error,
            'EMAIL_SEND_ERROR'
          )
        );
      }

    } catch (error) {
      console.error('Error en sendRsvpConfirmation:', error);
      return res.status(500).json(
        createErrorResponse(
          'Error interno del servidor',
          'Ocurrió un error inesperado',
          'INTERNAL_ERROR'
        )
      );
    }
  }

  /**
   * Verifica el estado del servicio de email
   */
  async checkEmailServiceStatus(req, res) {
    try {
      const status = await emailService.validateConfiguration();
      
      if (status.valid) {
        return res.status(200).json(
          createSuccessResponse('Servicio de email funcionando correctamente', {
            status: 'operational',
            timestamp: new Date().toISOString()
          })
        );
      } else {
        return res.status(503).json(
          createErrorResponse(
            'Servicio de email no disponible',
            status.error,
            'SERVICE_UNAVAILABLE'
          )
        );
      }

    } catch (error) {
      console.error('Error verificando servicio de email:', error);
      return res.status(500).json(
        createErrorResponse(
          'Error verificando servicio',
          'No se pudo verificar el estado del servicio',
          'CHECK_ERROR'
        )
      );
    }
  }

  /**
   * Endpoint de prueba para desarrolladores
   */
  async sendTestEmail(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json(
          createErrorResponse('Email requerido', 'Debes proporcionar un email para la prueba', 'MISSING_EMAIL')
        );
      }

      // Datos de prueba
      const testData = {
        nombre: 'Usuario de Prueba',
        emailRemitente: email,
        numeroAcompañantes: '1',
        menu: 'pollo',
        agregarAcompañantes: true,
        mismoPlato: false,
        acompañantes: [
          {
            nombre: 'Acompañante de Prueba',
            platillo: 'pasta'
          }
        ],
        alergias: 'Sin alergias conocidas'
      };

      const result = await emailService.sendRsvpConfirmation(testData);

      if (result.success) {
        return res.status(200).json(
          createSuccessResponse(
            'Email de prueba enviado exitosamente',
            {
              messageId: result.messageId,
              recipient: email,
              timestamp: new Date().toISOString()
            }
          )
        );
      } else {
        return res.status(500).json(
          createErrorResponse(
            'Error enviando email de prueba',
            result.error,
            'TEST_EMAIL_ERROR'
          )
        );
      }

    } catch (error) {
      console.error('Error en sendTestEmail:', error);
      return res.status(500).json(
        createErrorResponse(
          'Error interno del servidor',
          'Ocurrió un error inesperado',
          'INTERNAL_ERROR'
        )
      );
    }
  }
}

module.exports = new EmailController();
