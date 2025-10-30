'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registrations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      registration_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código único de inscripción (INS-YYYYMMDD-XXXXX)'
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      participant_type: {
        type: Sequelize.ENUM('individual', 'empresa'),
        allowNull: false,
        defaultValue: 'individual'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Formato: +502 XXXX-XXXX'
      },
      nit: {
        type: Sequelize.STRING(15),
        allowNull: true,
        comment: 'NIT guatemalteco: 12345678-9'
      },
      cui: {
        type: Sequelize.STRING(13),
        allowNull: true,
        comment: 'CUI guatemalteco: 13 dígitos'
      },
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'BORRADOR',
          'PENDIENTE_PAGO',
          'PAGADO',
          'CONFIRMADO',
          'CANCELADO',
          'EXPIRADO',
          'REEMBOLSADO'
        ),
        allowNull: false,
        defaultValue: 'BORRADOR'
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      final_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      payment_reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      reservation_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de reserva temporal (15 min)'
      },
      custom_fields: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Campos personalizados del evento'
      },
      group_registration_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'group_registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('registrations', ['registration_code'], {
      unique: true,
      name: 'idx_registrations_code'
    });
    await queryInterface.addIndex('registrations', ['event_id'], {
      name: 'idx_registrations_event'
    });
    await queryInterface.addIndex('registrations', ['user_id'], {
      name: 'idx_registrations_user'
    });
    await queryInterface.addIndex('registrations', ['status'], {
      name: 'idx_registrations_status'
    });
    await queryInterface.addIndex('registrations', ['email'], {
      name: 'idx_registrations_email'
    });
    await queryInterface.addIndex('registrations', ['reservation_expires_at'], {
      name: 'idx_registrations_expires'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registrations');
  }
};