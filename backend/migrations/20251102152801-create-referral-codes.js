'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referral_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del código de referido'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código único del referido (case-insensitive)'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario propietario del código',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('PERSONAL', 'CAMPAIGN', 'PROMOTIONAL', 'SYSTEM'),
        allowNull: false,
        defaultValue: 'PERSONAL',
        comment: 'Tipo de código de referido'
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
        comment: 'Estado del código de referido'
      },
      name: {
        type: Sequelize.STRING(255),
        comment: 'Nombre del código/campaña'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'Descripción del código de referido'
      },
      max_uses: {
        type: Sequelize.INTEGER,
        comment: 'Máximo número de usos permitidos (null = ilimitado)'
      },
      current_uses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número actual de usos'
      },
      expires_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de expiración del código'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el código es público y puede ser usado por cualquiera'
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 4),
        comment: 'Tasa de comisión para el referido (0.0000 - 1.0000)'
      },
      reward_config: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Configuración de recompensas para el referido'
      },
      campaign_id: {
        type: Sequelize.STRING(100),
        comment: 'ID de campaña asociada'
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
        comment: 'Metadatos adicionales del código'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('referral_codes', ['code'], {
      unique: true
    });
    await queryInterface.addIndex('referral_codes', ['user_id']);
    await queryInterface.addIndex('referral_codes', ['type']);
    await queryInterface.addIndex('referral_codes', ['status']);
    await queryInterface.addIndex('referral_codes', ['expires_at']);
    await queryInterface.addIndex('referral_codes', ['is_public']);
    await queryInterface.addIndex('referral_codes', ['campaign_id']);
    await queryInterface.addIndex('referral_codes', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('referral_codes');
  }
};
