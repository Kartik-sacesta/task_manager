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
const roleMiddleware = require("../middleware/rolemiddleware");
router.use(authMiddleware);
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/alltask/analytics", roleMiddleware, getTaskAnalytics);
router.get("/analytics/:userId", roleMiddleware, getUserTaskAnalytics);

module.exports = router;
