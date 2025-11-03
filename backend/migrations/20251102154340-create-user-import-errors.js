'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_import_errors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_import_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_imports',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la importación relacionada'
      },
      row_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Número de fila en el archivo original (1-based)'
      },
      raw_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Datos crudos de la fila que falló'
      },
      error_type: {
        type: Sequelize.ENUM(
          'validation_error',
          'duplicate_email',
          'duplicate_nit',
          'duplicate_cui',
          'invalid_format',
          'missing_required_field',
          'database_error',
          'unknown_error'
        ),
        allowNull: false,
        comment: 'Tipo de error encontrado'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Mensaje descriptivo del error'
      },
      field_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre del campo que causó el error (si aplica)'
      },
      field_value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Valor del campo que causó el error (si aplica)'
      },
      suggested_fix: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Sugerencia para corregir el error'
      },
      is_resolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si el error ha sido resuelto'
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha cuando se resolvió el error'
      },
      resolved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que resolvió el error'
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
    await queryInterface.addIndex('user_import_errors', ['user_import_id'], {
      name: 'user_import_errors_user_import_id_index'
    });

    await queryInterface.addIndex('user_import_errors', ['error_type'], {
      name: 'user_import_errors_error_type_index'
    });

    await queryInterface.addIndex('user_import_errors', ['is_resolved'], {
      name: 'user_import_errors_is_resolved_index'
    });

    await queryInterface.addIndex('user_import_errors', ['resolved_by'], {
      name: 'user_import_errors_resolved_by_index'
    });

    await queryInterface.addIndex('user_import_errors', ['created_at'], {
      name: 'user_import_errors_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_import_errors');
  }
};