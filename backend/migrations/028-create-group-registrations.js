'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_registrations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      groupCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código grupal maestro (GRP-YYYYMMDD-XXXXX)'
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
      organizerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contactEmail: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      contactPhone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      nit: {
        type: Sequelize.STRING(15),
        allowNull: true,
        comment: 'NIT de la empresa'
      },
      participantCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad total de participantes'
      },
      basePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      groupDiscountPercent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje de descuento grupal aplicado'
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
      paymentReference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      reservationExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de reserva temporal (15 min)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('group_registrations', ['groupCode'], {
      unique: true,
      name: 'idx_group_registrations_code'
    });
    await queryInterface.addIndex('group_registrations', ['eventId'], {
      name: 'idx_group_registrations_event'
    });
    await queryInterface.addIndex('group_registrations', ['organizerId'], {
      name: 'idx_group_registrations_organizer'
    });
    await queryInterface.addIndex('group_registrations', ['status'], {
      name: 'idx_group_registrations_status'
    });
    await queryInterface.addIndex('group_registrations', ['reservationExpiresAt'], {
      name: 'idx_group_registrations_expires'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_registrations');
  }
};