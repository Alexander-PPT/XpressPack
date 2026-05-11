'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditorias', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tipoAccion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entidadTipo: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entidadId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      detalles: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('auditorias', ['tipoAccion']);
    await queryInterface.addIndex('auditorias', ['usuarioId']);
    await queryInterface.addIndex('auditorias', ['entidadId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auditorias');
  }
};
