'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('Admin123!', 10);
    const hashedPassword2 = await bcrypt.hash('Operario123!', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        nombre: 'Administrador RutaSync',
        email: 'admin@rutasync.com',
        passwordHash: hashedPassword1,
        rol: 'ADMIN',
        estado: true,
        telefonoContacto: '+51999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        nombre: 'Operario Prueba',
        email: 'operario@rutasync.com',
        passwordHash: hashedPassword2,
        rol: 'OPERARIO',
        estado: true,
        telefonoContacto: '+51988888888',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: ['admin@rutasync.com', 'operario@rutasync.com']
    }, {});
  }
};
