'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promo_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código promocional único (case-insensitive)'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre/descripción del código'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada'
      },
      discount_type: {
        type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'SPECIAL_PRICE'),
        allowNull: false,
        comment: 'Tipo de descuento'
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor del descuento (porcentaje, monto fijo, etc.)'
      },
      // Configuración temporal
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de vigencia'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de vigencia'
      },
      // Límites de uso
      max_uses_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Máximo de usos totales (null = ilimitado)'
      },
      max_uses_per_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Máximo de usos por usuario'
      },
      current_uses_total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Usos actuales totales'
      },
      // Estado
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado del código'
      },
      // Restricciones adicionales
      min_purchase_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto mínimo de compra'
      },
      max_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto máximo de descuento (para porcentajes)'
      },
      // Combinación con otras promociones
      is_stackable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si puede combinarse con otros descuentos'
      },
      // Referencia a promoción padre (opcional)
      promotion_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'promotions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Promoción padre (si pertenece a una campaña)'
      },
      // Auditoría
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que creó el código'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que actualizó el código'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('promo_codes', ['code'], {
      name: 'promo_codes_code_index'
    });

    await queryInterface.addIndex('promo_codes', ['discount_type'], {
      name: 'promo_codes_discount_type_index'
    });

    await queryInterface.addIndex('promo_codes', ['is_active'], {
      name: 'promo_codes_is_active_index'
    });

    await queryInterface.addIndex('promo_codes', ['start_date'], {
      name: 'promo_codes_start_date_index'
    });

    await queryInterface.addIndex('promo_codes', ['end_date'], {
      name: 'promo_codes_end_date_index'
    });

    await queryInterface.addIndex('promo_codes', ['promotion_id'], {
      name: 'promo_codes_promotion_id_index'
    });

    await queryInterface.addIndex('promo_codes', ['created_by'], {
      name: 'promo_codes_created_by_index'
    });

    await queryInterface.addIndex('promo_codes', ['created_at'], {
      name: 'promo_codes_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promo_codes');
  }
};