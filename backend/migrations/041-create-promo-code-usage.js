'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promo_code_usage', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      promo_code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'promo_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Código promocional usado'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que usó el código'
      },
      registration_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Inscripción donde se aplicó el descuento'
      },
      cart_session_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID de sesión del carrito (si aplica antes de registro)'
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Evento al que se aplicó el descuento'
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del descuento aplicado'
      },
      original_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto original antes del descuento'
      },
      final_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto final después del descuento'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ',
        comment: 'Moneda del descuento'
      },
      // Información adicional
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent del navegador'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Dirección IP del usuario'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del uso'
      },
      // Estado
      status: {
        type: Sequelize.ENUM('APPLIED', 'CANCELLED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'APPLIED',
        comment: 'Estado del uso del código'
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha y hora de aplicación'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cancelación (si aplica)'
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
      }
    });

    // Índices
    await queryInterface.addIndex('promo_code_usage', ['promo_code_id'], {
      name: 'promo_code_usage_promo_code_id_index'
    });

    await queryInterface.addIndex('promo_code_usage', ['user_id'], {
      name: 'promo_code_usage_user_id_index'
    });

    await queryInterface.addIndex('promo_code_usage', ['registration_id'], {
      name: 'promo_code_usage_registration_id_index'
    });

    await queryInterface.addIndex('promo_code_usage', ['event_id'], {
      name: 'promo_code_usage_event_id_index'
    });

    await queryInterface.addIndex('promo_code_usage', ['status'], {
      name: 'promo_code_usage_status_index'
    });

    await queryInterface.addIndex('promo_code_usage', ['applied_at'], {
      name: 'promo_code_usage_applied_at_index'
    });

    // Índice compuesto para consultas de uso por usuario y código
    await queryInterface.addIndex('promo_code_usage', ['user_id', 'promo_code_id'], {
      name: 'promo_code_usage_user_promo_index'
    });

    // Índice compuesto para consultas de uso por evento
    await queryInterface.addIndex('promo_code_usage', ['event_id', 'applied_at'], {
      name: 'promo_code_usage_event_date_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promo_code_usage');
  }
};