const user = require("../model/User");
const roles = require("../model/Role");
const user_roles = require("../model/User_Role");

const createUserRole = async (user_id, role_id) => {
  if (!user_id || !role_id) {
    throw new Error("User ID and Role ID are required");
  }

  const foundUser = await user.findOne({
    where: { id: user_id, is_active: true },
  });
  if (!foundUser) {
    throw new Error("User not found");
  }
  const foundRole = await roles.findOne({
    where: { id: role_id, is_active: true },
  });
  if (!foundRole) {
    throw new Error("Role not found");
  }
  const existingUserRole = await user_roles.findOne({
    where: { user_id, role_id },
  });
  if (existingUserRole) {
    throw new Error("User already has this role");
  }
  try {
    const newUserRole = await user_roles.create({
      user_id,
      role_id,
    });
    return newUserRole;
  } catch (error) {
    console.error(error);
    throw new Error("Server error");
  }
};

module.exports = { createUserRole };
