const { where } = require("sequelize");
const Task_Comments = require("../model/Task_Comments");
const User = require("../model/User");
const User_Role = require("../model/User_Role");
const Role = require("../model/Role");

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
    const taskComments = await Task_Comments.findAll({
      where: { task_id: id, is_active: true },
      order: [["createdAt", "DESC"]],
    });

    if (!taskComments || taskComments.length === 0) {
      return res.status(404).json({
        message:
          "No task comments found ",
      });
    }

    const commentsWithUserData = await Promise.all(
      taskComments.map(async (comment) => {
        const userData = await User.findOne({
          where: { id: comment.created_by },
        });
        let userName = null;
        let userRole = null;

        if (userData) {
          userName = userData.name;
          const userRoleData = await User_Role.findOne({
            where: { user_id: userData.id },
          });
          if (userRoleData) {
            const roleData = await Role.findOne({
              where: { id: userRoleData.role_id },
            });
            if (roleData) {
              userRole = roleData.title;
            }
          }
        }

        return {
          ...comment.toJSON(),
          created_by_name: userName,
          created_by_role: userRole,
        };
      })
    );

    res.status(200).json(commentsWithUserData);
  } catch (error) {
    console.error("Error fetching task comments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTaskComments = async (req, res) => {
  const { id } = req.params;

  try {
    const user_id = req.user.id;
    //  console.log(user_id);
    const task_comments = await Task_Comments.findOne({
      where: { id, is_active: true, created_by: user_id },
    });

    if (!task_comments) {
      return res.status(404).json({
        message:
          "Task Comment not found or you are not authorized to delete it",
      });
    }
    // await task_comments.destroy();
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
