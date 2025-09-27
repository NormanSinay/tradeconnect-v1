'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar roles del sistema
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrador',
        description: 'Acceso total al sistema, incluyendo configuración de infraestructura',
        isActive: true,
        isSystem: true,
        level: 10,
        color: '#D32F2F',
        icon: 'shield-crown',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin',
        displayName: 'Administrador',
        description: 'Administrador con acceso amplio al sistema',
        isActive: true,
        isSystem: true,
        level: 9,
        color: '#FF5722',
        icon: 'shield-admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manager',
        displayName: 'Gerente',
        description: 'Gerente con permisos de gestión de eventos y usuarios',
        isActive: true,
        isSystem: true,
        level: 7,
        color: '#FF9800',
        icon: 'briefcase',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'operator',
        displayName: 'Operador',
        description: 'Operador con permisos limitados de gestión',
        isActive: true,
        isSystem: true,
        level: 5,
        color: '#2196F3',
        icon: 'settings',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'user',
        displayName: 'Usuario',
        description: 'Usuario regular del sistema',
        isActive: true,
        isSystem: true,
        level: 3,
        color: '#4CAF50',
        icon: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'speaker',
        displayName: 'Speaker',
        description: 'Expositor o conferencista de eventos',
        isActive: true,
        isSystem: true,
        level: 4,
        color: '#9C27B0',
        icon: 'microphone',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'participant',
        displayName: 'Participante',
        description: 'Participante en eventos',
        isActive: true,
        isSystem: true,
        level: 2,
        color: '#607D8B',
        icon: 'user-group',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'client',
        displayName: 'Cliente',
        description: 'Cliente externo',
        isActive: true,
        isSystem: true,
        level: 1,
        color: '#795548',
        icon: 'user-tie',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('roles', roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};