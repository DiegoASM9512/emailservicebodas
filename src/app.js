const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
const emailRoutes = require('./routes/emailRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: config.cors.allowedOrigins === '*' ? true : config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: config.rateLimit.maxRequestsPerMinute,
  message: {
    error: 'Demasiadas solicitudes, intenta nuevamente en un minuto',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Redirección desde la raíz a la documentación
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API de correos para boda funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    documentation: '/api-docs'
  });
});

// Rutas principales
app.use('/api/email', emailRoutes);

// Middleware de manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
