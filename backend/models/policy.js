'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Policy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con el usuario que creó la política
      Policy.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Asociación con el usuario que actualizó la política
      Policy.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }
  Policy.init({
    type: {
      type: DataTypes.ENUM('privacy', 'cookies', 'data_processing', 'security'),
      allowNull: false,
      comment: 'Tipo de política'
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Versión de la política (ej: 1.0, 2.1)'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Título de la política'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido completo de la política'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si esta versión está activa'
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha efectiva de la política'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que creó la política'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que actualizó la política'
    }
  }, {
    sequelize,
    modelName: 'Policy',
    tableName: 'policies',
    paranoid: true, // Soft delete
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return Policy;
};