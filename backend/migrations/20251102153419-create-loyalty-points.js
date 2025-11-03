'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_points', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único del punto de lealtad'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario propietario de los puntos'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad de puntos (positivo = ganado, negativo = gastado)'
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Razón de la transacción de puntos'
      },
      transaction_type: {
        type: Sequelize.ENUM('earned', 'spent', 'expired', 'bonus'),
        allowNull: false,
        comment: 'Tipo de transacción de puntos'
      },
      reference_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ID de referencia de la transacción (ej. ID de evento, compra)'
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Tipo de referencia (ej. event, purchase, referral)'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de expiración de los puntos'
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
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Crear índices
    await queryInterface.addIndex('loyalty_points', ['user_id'], {
      name: 'loyalty_points_user_id'
    });
    await queryInterface.addIndex('loyalty_points', ['transaction_type'], {
      name: 'loyalty_points_transaction_type'
    });
    await queryInterface.addIndex('loyalty_points', ['reference_id'], {
      name: 'loyalty_points_reference_id'
    });
    await queryInterface.addIndex('loyalty_points', ['expires_at'], {
      name: 'loyalty_points_expires_at'
    });
    await queryInterface.addIndex('loyalty_points', ['created_at'], {
      name: 'loyalty_points_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('loyalty_points', 'loyalty_points_user_id');
    await queryInterface.removeIndex('loyalty_points', 'loyalty_points_transaction_type');
    await queryInterface.removeIndex('loyalty_points', 'loyalty_points_reference_id');
    await queryInterface.removeIndex('loyalty_points', 'loyalty_points_expires_at');
    await queryInterface.removeIndex('loyalty_points', 'loyalty_points_created_at');

    // Eliminar tabla
    await queryInterface.dropTable('loyalty_points');
  }
};
