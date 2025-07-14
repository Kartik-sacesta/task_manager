const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const SubCategory = require("./SubCategory"); // Import SubCategory model for association

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
        model: "users", // Assuming you have a 'users' table
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
    sub_category_id: { // New field for linking to SubCategory
      type: DataTypes.INTEGER,
      allowNull: true, // A task must belong to a subcategory
      references: {
        model: "sub_categories", // Refers to the 'sub_categories' table
        key: "id",
      },
      onDelete: "SET NULL", // If a subcategory is deleted, set task's sub_category_id to NULL
      // Or 'RESTRICT' if you want to prevent subcategory deletion if tasks are associated
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // 1 for active, 0 for inactive
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
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