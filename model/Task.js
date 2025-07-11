const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    expried_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "in-progress", "completed"),
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Urgent"),
      defaultValue: "Medium",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "tasks",
    paranoid: true,
    deletedAt: "deletedAt",
  }
);

module.exports = Task;
