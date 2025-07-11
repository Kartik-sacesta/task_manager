const Task_Comments = require("../model/Task_Comments");

const createTaskComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    if (!comments) {
      return res.status(404).json({ message: "Comments not found" });
    }
    const taskcomment = await Task_Comments.create({
      task_id: id,
      comments,
      created_by: req.user.id,
    });

    if (!taskcomment) {
      return res.status(500).json({ message: "Task Comments  failed" });
    }
    res.status(201).json({ message: "Task Comment successfully", taskcomment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getTaskComments = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.user.id;
    const taskcomment = await Task_Comments.findAll({
      where: { task_id: id, is_active: true },

      order: [["createdAt", "DESC"]],
    });

    if (!taskcomment) {
      return res.status(404).json({
        message:
          "Task Comment not found or you are not authorized to delete it",
      });
    }
    res.status(200).json(taskcomment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTaskComments = async (req, res) => {
  const { id } = req.params;

  try {
    const user_id = req.user.id;
    console.log(user_id);
    const task_comments = await Task_Comments.findOne({
      where: { id, is_active: true, created_by: user_id },
    });

    if (!task_comments) {
      return res.status(404).json({
        message:
          "Task Comment not found or you are not authorized to delete it",
      });
    }
    await task_comments.destroy();
    await task_comments.update({ is_active: false });
    res.status(200).json({ message: "Task Comments deleted successfully " });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTaskComments,
  getTaskComments,
  deleteTaskComments,
};
