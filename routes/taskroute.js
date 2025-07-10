const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  getTaskById,
  deleteTask,
  getTaskAnalytics,
  getUserTaskAnalytics,
} = require("../controllers/taskcontroller");
const authMiddleware = require("../middleware/authmiddleware");
//router.use(authMiddleware);
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/alltask/analytics", getTaskAnalytics);
router.get("/analytics/:userId", getUserTaskAnalytics);

module.exports = router;
