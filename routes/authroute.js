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
} = require("../controllers/authcontroller");
const roleMiddleware = require("../middleware/rolemiddleware");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", authmiddleware,roleMiddleware,register);
router.post("/login", login);

router.get("/", getuser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/me",tokenvalidate);

module.exports = router;
