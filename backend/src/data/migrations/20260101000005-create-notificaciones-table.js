'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificaciones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      destinatarioEmail: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      asunto: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      envioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'envios',
          key: 'id'
        }
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'ENVIADO', 'FALLIDO'),
        defaultValue: 'PENDIENTE'
      },
      mensajeError: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      intentos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      proximoIntento: {
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

    await queryInterface.addIndex('notificaciones', ['estado']);
    await queryInterface.addIndex('notificaciones', ['envioId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notificaciones');
  }
};
