const { Sequelize } = require('sequelize');
const env = require('./env');

const dialect = env.database.dialect || 'postgres';

const define = {
  timestamps: true,
  underscored: false
};

if (dialect === 'mysql') {
  define.charset = 'utf8mb4';
  define.collate = 'utf8mb4_unicode_ci';
}

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect,
    logging: env.app.env === 'development' ? console.log : false,
    define,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
