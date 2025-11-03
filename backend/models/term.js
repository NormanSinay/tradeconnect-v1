'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Term extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con el usuario que creó los términos
      Term.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Asociación con el usuario que actualizó los términos
      Term.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }
  Term.init({
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Versión de los términos (ej: 1.0, 2.1)'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Título de los términos'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido completo de los términos'
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
      comment: 'Fecha efectiva de los términos'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que creó los términos'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que actualizó los términos'
    }
  }, {
    sequelize,
    modelName: 'Term',
    tableName: 'terms',
    paranoid: true, // Soft delete
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return Term;
};