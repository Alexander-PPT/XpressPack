'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('envios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      guia: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      codigoTracking: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      remitenteDni: {
        type: Sequelize.CHAR(8),
        allowNull: false
      },
      remitenteNombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      remitenteEmail: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      remitentePhone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      destinatarioDni: {
        type: Sequelize.CHAR(8),
        allowNull: false
      },
      destinatarioNombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      destinatarioEmail: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      destinatarioPhone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      peso: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      volumen: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      tipoServicio: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado: {
        type: Sequelize.STRING,
        defaultValue: 'Recibido'
      },
      sucursalOrigenId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sucursales',
          key: 'id'
        }
      },
      sucursalDestinoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sucursales',
          key: 'id'
        }
      },
      operarioAsignadoId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      fechaEntrega: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('envios', ['guia']);
    await queryInterface.addIndex('envios', ['codigoTracking']);
    await queryInterface.addIndex('envios', ['estado']);
    await queryInterface.addIndex('envios', ['remitenteDni']);
    await queryInterface.addIndex('envios', ['destinatarioDni']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('envios');
  }
};
