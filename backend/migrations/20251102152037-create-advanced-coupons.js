'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('advanced_coupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del cupón avanzado'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código único del cupón (case-insensitive)'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del cupón'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'Descripción detallada del cupón'
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        comment: 'Estado del cupón'
      },
      discount_config: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Configuración del descuento'
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Condiciones para aplicar el cupón'
      },
      application_type: {
        type: Sequelize.ENUM('AUTOMATIC', 'MANUAL', 'CONDITIONAL'),
        allowNull: false,
        defaultValue: 'MANUAL',
        comment: 'Tipo de aplicación del cupón'
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Prioridad para resolución de conflictos (mayor = más prioritario)'
      },
      is_stackable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si puede combinarse con otros descuentos'
      },
      start_date: {
        type: Sequelize.DATE,
        comment: 'Fecha de inicio de vigencia'
      },
      end_date: {
        type: Sequelize.DATE,
        comment: 'Fecha de fin de vigencia'
      },
      max_uses_total: {
        type: Sequelize.INTEGER,
        comment: 'Máximo de usos totales (null = ilimitado)'
      },
      max_uses_per_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Máximo de usos por usuario'
      },
      current_uses_total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Usos actuales totales'
      },
      min_purchase_amount: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Monto mínimo de compra'
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        comment: 'Monto máximo de descuento'
      },
      applicable_events: {
        type: Sequelize.JSON,
        comment: 'IDs de eventos aplicables'
      },
      applicable_categories: {
        type: Sequelize.JSON,
        comment: 'IDs de categorías aplicables'
      },
      applicable_user_types: {
        type: Sequelize.JSON,
        comment: 'Tipos de usuario aplicables'
      },
      applicable_user_segments: {
        type: Sequelize.JSON,
        comment: 'Segmentos de usuario aplicables'
      },
      auto_apply: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se aplica automáticamente'
      },
      requires_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si requiere aprobación manual'
      },
      usage_limit_window: {
        type: Sequelize.INTEGER,
        comment: 'Ventana de tiempo para límites de uso (horas)'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Usuario que creó el cupón',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        comment: 'Usuario que actualizó el cupón',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('advanced_coupons', ['code'], {
      unique: true
    });
    await queryInterface.addIndex('advanced_coupons', ['status']);
    await queryInterface.addIndex('advanced_coupons', ['application_type']);
    await queryInterface.addIndex('advanced_coupons', ['priority']);
    await queryInterface.addIndex('advanced_coupons', ['start_date']);
    await queryInterface.addIndex('advanced_coupons', ['end_date']);
    await queryInterface.addIndex('advanced_coupons', ['created_by']);
    await queryInterface.addIndex('advanced_coupons', ['created_at']);
    await queryInterface.addIndex('advanced_coupons', ['auto_apply']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('advanced_coupons');
  }
};
