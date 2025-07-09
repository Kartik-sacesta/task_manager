const { sequelize } = require("../config/db");
const Task = require("./Task");
const User = require("./User"); 


User.hasMany(Task, { 
  foreignKey: 'created_by', 
  as: 'tasks' 
});

Task.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator' 
});

module.exports = {
  sequelize,
  Task,
  User
};