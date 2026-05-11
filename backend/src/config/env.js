require('dotenv').config();

module.exports = {
  app: {
    port: process.env.APP_PORT || 3001,
    host: process.env.APP_HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'rutasync_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@rutasync.com'
  },
  
  reniec: {
    apiUrl: process.env.RENIEC_API_URL || 'https://api.reniec.gob.pe',
    apiKey: process.env.RENIEC_API_KEY || ''
  }
};
