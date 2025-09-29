'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar roles del sistema
    const roles = [
      {
        name: 'super_admin',
        display_name: 'Super Administrador',
        description: 'Acceso total al sistema, incluyendo configuración de infraestructura',
        is_active: true,
        is_system: true,
        level: 10,
        color: '#D32F2F',
        icon: 'shield-crown',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'admin',
        display_name: 'Administrador',
        description: 'Administrador con acceso amplio al sistema',
        is_active: true,
        is_system: true,
        level: 9,
        color: '#FF5722',
        icon: 'shield-admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manager',
        display_name: 'Gerente',
        description: 'Gerente con permisos de gestión de eventos y usuarios',
        is_active: true,
        is_system: true,
        level: 7,
        color: '#FF9800',
        icon: 'briefcase',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'operator',
        display_name: 'Operador',
        description: 'Operador con permisos limitados de gestión',
        is_active: true,
        is_system: true,
        level: 5,
        color: '#2196F3',
        icon: 'settings',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'user',
        display_name: 'Usuario',
        description: 'Usuario regular del sistema',
        is_active: true,
        is_system: true,
        level: 3,
        color: '#4CAF50',
        icon: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'speaker',
        display_name: 'Speaker',
        description: 'Expositor o conferencista de eventos',
        is_active: true,
        is_system: true,
        level: 4,
        color: '#9C27B0',
        icon: 'microphone',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'participant',
        display_name: 'Participante',
        description: 'Participante en eventos',
        is_active: true,
        is_system: true,
        level: 2,
        color: '#607D8B',
        icon: 'user-group',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'client',
        display_name: 'Cliente',
        description: 'Cliente externo',
        is_active: true,
        is_system: true,
        level: 1,
        color: '#795548',
        icon: 'user-tie',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('roles', roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};