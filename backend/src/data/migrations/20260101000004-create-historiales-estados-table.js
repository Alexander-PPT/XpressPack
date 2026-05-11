'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historiales_estados', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      envioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'envios',
          key: 'id'
        }
      },
      estadoAnterior: {
        type: Sequelize.ENUM('Recibido', 'En Viaje', 'Entregado'),
        allowNull: true
      },
      estadoNuevo: {
        type: Sequelize.ENUM('Recibido', 'En Viaje', 'Entregado'),
        allowNull: false
      },
      razon: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      operarioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      ubicacion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fotografia: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('historiales_estados', ['envioId']);
    await queryInterface.addIndex('historiales_estados', ['operarioId']);
    await queryInterface.addIndex('historiales_estados', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historiales_estados');
  }
};
