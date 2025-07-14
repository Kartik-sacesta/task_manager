const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); 
const Category = require("./Category"); 

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories", 
        key: "id",
      },
      onDelete: "CASCADE", 
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  },
  {
    timestamps: true, 
    tableName: "sub_categories",
    paranoid: true, 
    deletedAt: "deletedAt",
  }
);

module.exports = SubCategory;