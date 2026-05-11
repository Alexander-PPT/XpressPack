'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      rol: {
        type: Sequelize.ENUM('ADMIN', 'OPERARIO'),
        defaultValue: 'OPERARIO'
      },
      sucursalId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      estado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      telefonoContacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ultimoAcceso: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Crear índices
    await queryInterface.addIndex('usuarios', ['email']);
    await queryInterface.addIndex('usuarios', ['rol']);
    await queryInterface.addIndex('usuarios', ['sucursalId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
