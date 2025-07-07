const roles = require("../model/Role");
const user_roles = require("../model/User_Role");
const user = require("../model/User");
const createRole = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const newRole = await roles.create({
      title,
    });

    res.status(201).json(newRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createUserRole = async (req, res) => {
  const { user_id, role_id } = req.body;
  const foundUser = await user.findOne({
    where: { id: user_id, is_active: true },
  });
  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const foundRole = await roles.findOne({
    where: { id: role_id, is_active: true },
  });
  if (!foundRole) {
    return res.status(404).json({ message: "Role not found" });
  }
  const existingUserRole = await user_roles.findOne({
    where: { user_id, role_id },
  });
  if (existingUserRole) {
    return res.status(400).json({ message: "User already has this role" });
  }
  if (!user_id || !role_id) {
    return res
      .status(400)
      .json({ message: "User ID and Role ID are required" });
  }
  try {
    const newUserRole = await user_roles.create({
      user_id,
      role_id,
    });

    res.status(201).json(newUserRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRoles = async (req, res) => {
  try {
    const allRoles = await roles.findAll({
      where: { is_active: true },
    });

    res.status(200).json(allRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await roles.findOne({
      where: { id, is_active: true },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.update({ is_active: false });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const role = await roles.findOne({
      where: { id, is_active: true },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const updatedRole = await role.update({
      title,
    });

    res.status(200).json(updatedRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  deleteRole,
  updateRole,
  createUserRole,
};
