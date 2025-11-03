'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StaticPage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con el usuario que creó la página
      StaticPage.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // Asociación con el usuario que actualizó la página
      StaticPage.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'updater'
      });
    }
  }
  StaticPage.init({
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Slug único para la URL de la página'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Título de la página'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido HTML de la página'
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Meta título para SEO'
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Meta descripción para SEO'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si la página está publicada'
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
      comment: 'Usuario que creó la página'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Usuario que actualizó la página'
    }
  }, {
    sequelize,
    modelName: 'StaticPage',
    tableName: 'static_pages',
    paranoid: true, // Soft delete
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });
  return StaticPage;
};