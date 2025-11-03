'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_imports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del archivo importado'
      },
      original_filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre original del archivo'
      },
      file_path: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ruta del archivo en el servidor'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tamaño del archivo en bytes'
      },
      total_rows: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de filas en el archivo'
      },
      processed_rows: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Filas procesadas exitosamente'
      },
      failed_rows: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Filas con errores'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado del proceso de importación'
      },
      import_type: {
        type: Sequelize.ENUM('create', 'update', 'create_update'),
        allowNull: false,
        defaultValue: 'create',
        comment: 'Tipo de importación: crear, actualizar o crear/actualizar'
      },
      skip_duplicates: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si se deben omitir duplicados'
      },
      send_welcome_emails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se deben enviar emails de bienvenida'
      },
      assigned_role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del rol a asignar a los usuarios importados'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del usuario que realizó la importación'
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de inicio del procesamiento'
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de finalización del procesamiento'
      },
      processing_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo de procesamiento en milisegundos'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error general si falló la importación'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales de la importación'
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
    await queryInterface.addIndex('user_imports', ['status'], {
      name: 'user_imports_status_index'
    });

    await queryInterface.addIndex('user_imports', ['created_by'], {
      name: 'user_imports_created_by_index'
    });

    await queryInterface.addIndex('user_imports', ['assigned_role_id'], {
      name: 'user_imports_assigned_role_id_index'
    });

    await queryInterface.addIndex('user_imports', ['created_at'], {
      name: 'user_imports_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_imports');
  }
};