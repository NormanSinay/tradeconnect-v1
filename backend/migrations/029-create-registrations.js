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
      registrationCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código único de inscripción (INS-YYYYMMDD-XXXXX)'
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      participantType: {
        type: Sequelize.ENUM('individual', 'empresa'),
        allowNull: false,
        defaultValue: 'individual'
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      lastName: {
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
      companyName: {
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
      basePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      finalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      paymentReference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      reservationExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de reserva temporal (15 min)'
      },
      customFields: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Campos personalizados del evento'
      },
      groupRegistrationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'group_registrations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('registrations', ['registrationCode'], {
      unique: true,
      name: 'idx_registrations_code'
    });
    await queryInterface.addIndex('registrations', ['eventId'], {
      name: 'idx_registrations_event'
    });
    await queryInterface.addIndex('registrations', ['userId'], {
      name: 'idx_registrations_user'
    });
    await queryInterface.addIndex('registrations', ['status'], {
      name: 'idx_registrations_status'
    });
    await queryInterface.addIndex('registrations', ['email'], {
      name: 'idx_registrations_email'
    });
    await queryInterface.addIndex('registrations', ['reservationExpiresAt'], {
      name: 'idx_registrations_expires'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registrations');
  }
};