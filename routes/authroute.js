const express = require("express");
const router = express.Router();

const {
  register,
  getUserById,
  getuser,
  updateUser,
  deleteUser,
  login,
} = require("../controllers/authcontroller");
const roleMiddleware = require("../middleware/rolemiddleware");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", authmiddleware,roleMiddleware,register);
router.post("/login", login);

router.get("/", getuser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
