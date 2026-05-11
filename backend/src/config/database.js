const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: env.app.env === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;
