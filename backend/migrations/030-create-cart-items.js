'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      participantType: {
        type: Sequelize.ENUM('individual', 'empresa'),
        allowNull: false,
        defaultValue: 'individual'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 50
        }
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
      isGroupRegistration: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      groupData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos del grupo si es inscripción grupal'
      },
      participantData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos de participantes individuales'
      },
      customFields: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Campos personalizados del evento'
      },
      addedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('cart_items', ['cartId'], {
      name: 'idx_cart_items_cart'
    });
    await queryInterface.addIndex('cart_items', ['eventId'], {
      name: 'idx_cart_items_event'
    });
    await queryInterface.addIndex('cart_items', ['participantType'], {
      name: 'idx_cart_items_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_items');
  }
};