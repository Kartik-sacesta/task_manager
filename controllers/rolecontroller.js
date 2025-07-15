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
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.status(500).json({ message: "Server error", error: error.message });
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
    // await role.destroy();
    await role.update({ is_active: false });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRole,
  getRoles,
  deleteRole,
  updateRole,
};
