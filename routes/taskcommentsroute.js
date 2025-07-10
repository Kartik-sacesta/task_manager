const express = require("express");
const router = express.Router();
const {
  getTaskComments,
  createTaskComments,
  deleteTaskComments,
} = require("../controllers/taskcomments");
const authMiddleware = require("../middleware/authmiddleware");
router.use(authMiddleware);
router.post("/:id", createTaskComments);
router.get("/:id", getTaskComments);

router.delete("/:id", deleteTaskComments);

module.exports = router;
