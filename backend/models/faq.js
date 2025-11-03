'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con el usuario que creó la FAQ
      Faq.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Asociación con el usuario que actualizó la FAQ
      Faq.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }
  Faq.init({
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Categoría de la FAQ (ej: general, eventos, pagos)'
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Pregunta frecuente'
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Respuesta a la pregunta'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Orden de aparición en la lista'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si la FAQ está publicada'
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de publicación'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que creó la FAQ'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que actualizó la FAQ'
    }
  }, {
    sequelize,
    modelName: 'Faq',
    tableName: 'faqs',
    paranoid: true, // Soft delete
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return Faq;
};