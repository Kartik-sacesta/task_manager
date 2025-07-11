const express = require("express");
const router = express.Router();

const {
  register,
  getUserById,
  getuser,
  updateUser,
  deleteUser,
  login,
  tokenvalidate,
  taskByUserId,
  getalluser,
} = require("../controllers/authcontroller");
const roleMiddleware = require("../middleware/rolemiddleware");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", register);
router.get("/task/:id", authmiddleware, roleMiddleware, taskByUserId);
router.post("/login", login);

router.get("/", getuser);
router.get("/alluser", authmiddleware, roleMiddleware, getalluser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/me", tokenvalidate);

module.exports = router;
