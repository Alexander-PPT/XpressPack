'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('sucursales', [
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        nombre: 'Sucursal Lima Centro',
        codigo: 'LIM-001',
        ciudad: 'Lima',
        departamento: 'Lima',
        direccion: 'Jirón Cusco 450, Lima',
        telefono: '01-9999999',
        email: 'lima@rutasync.com',
        encargado: 'Carlos López',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        nombre: 'Sucursal Arequipa',
        codigo: 'ARQ-001',
        ciudad: 'Arequipa',
        departamento: 'Arequipa',
        direccion: 'Calle Mercaderes 200, Arequipa',
        telefono: '054-202020',
        email: 'arequipa@rutasync.com',
        encargado: 'María González',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        nombre: 'Sucursal Trujillo',
        codigo: 'TRU-001',
        ciudad: 'Trujillo',
        departamento: 'La Libertad',
        direccion: 'Avenida Larco 300, Trujillo',
        telefono: '044-292929',
        email: 'trujillo@rutasync.com',
        encargado: 'Pedro Ramírez',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sucursales', {
      codigo: ['LIM-001', 'ARQ-001', 'TRU-001']
    }, {});
  }
};
