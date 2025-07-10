const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task_Comments = sequelize.define(
  "Task_Comments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "tasks",
        key: "id",
      },
      allowNull: false,
    },

    comments: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    created_by: {
      type: DataTypes.INTEGER, 
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "task_comments",
    paranoid: true,
    deletedAt: "deletedAt",
  }
);

module.exports = Task_Comments;
