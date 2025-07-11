const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");
const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "roles",
    paranoid: true,
    deletedAt: "deletedAt",
  }
);

module.exports = Role;
