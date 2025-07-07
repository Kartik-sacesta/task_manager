const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const User_Role = sequelize.define(
  "User_Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "roles",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_roles",
    paranoid: true,
    deletedAt: "deletedAt",
  }
);
module.exports = User_Role;
