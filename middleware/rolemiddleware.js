const Role = require("../model/Role");
const userRole = require("../model/User_Role");

const roleMiddleware = async (req, res, next) => {
  try {
    const userrole = await userRole.findOne({
      where: { user_id: req.user.id },
    });
    if (!userrole) {
      return res.status(403).json({ message: "User role not found" });
    }

    const role = await Role.findOne({
      where: { id: userrole.role_id, is_active: true },
    });

    if (!role || role.title !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    req.role_id = role.id;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = roleMiddleware;
