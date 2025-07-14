
const User = require('./User');
const Role = require('./Role');
const User_Role = require('./User_Role');
const Task = require('./Task'); 
const Task_Comments = require('./Task_Comments');
const Category = require('./Category'); 
const SubCategory = require('./SubCategory'); 

function defineAssociations() {
  // User and Role (Many-to-Many through User_Role)
  User.belongsToMany(Role, {
    through: User_Role,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles'
  });
  Role.belongsToMany(User, {
    through: User_Role,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users'
  });

  // User_Role and User (One-to-Many)
  User.hasMany(User_Role, {
    foreignKey: 'user_id',
    as: 'userRoles'
  });
  User_Role.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  // User_Role and Role (One-to-Many)
  Role.hasMany(User_Role, {
    foreignKey: 'role_id',
    as: 'roleUsers'
  });
  User_Role.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role'
  });

  // User and Task (One-to-Many: User creates many Tasks)
  User.hasMany(Task, {
    foreignKey: 'created_by',
    as: 'createdTasks'
  });
  Task.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Task and Task_Comments (One-to-Many: Task has many comments)
  Task.hasMany(Task_Comments, {
    foreignKey: 'task_id',
    as: 'comments'
  });
  Task_Comments.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task'
  });

  // User and Task_Comments (One-to-Many: User creates many comments)
  User.hasMany(Task_Comments, {
    foreignKey: 'created_by',
    as: 'createdComments'
  });
  Task_Comments.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'commentCreator'
  });

  // Category and SubCategory (One-to-Many: Category has many SubCategories)
  Category.hasMany(SubCategory, {
    foreignKey: 'category_id',
    as: 'subCategories'
  });
  SubCategory.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  })

  SubCategory.hasMany(Task, {
    foreignKey: 'sub_category_id',
    as: 'tasks'
  });
  Task.belongsTo(SubCategory, {
    foreignKey: 'sub_category_id',
    as: 'subCategory'
  });
}

module.exports = defineAssociations;
