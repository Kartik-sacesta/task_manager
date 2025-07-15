const SubCategory = require("../model/SubCategory");
const Task = require("../model/Task");
const User = require("../model/User");
const { Op, fn, col, where } = require("sequelize");

const createTask = async (req, res) => {
  const {
    title,
    description,
    expried_date,
    status,
    priority,
    sub_category_id,
  } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ message: "Title and created_by are required" });
  }

  try {
    const newTask = await Task.create({
      title,
      description,
      created_by: req.user.id,
      expried_date,
      status: status || "pending",
      priority,
      sub_category_id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTasks = async (req, res) => {
  const { category_id } = req.query;
  const { id } = req.params;

  try {
    if (id) {
      const tasks = await Task.findAll({
        where: { is_active: true, sub_category_id: id },
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json(tasks);
    }

    if (category_id) {
      const subCategories = await SubCategory.findAll({
        where: { category_id },
        attributes: ["id"],
      });

      //  console.log(subCategories);

      const subCategoryIds = subCategories.map((subCat) => subCat.id);

      const tasks = await Task.findAll({
        where: {
          is_active: true,
          sub_category_id: subCategoryIds,
        },
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(tasks);
    }

    // Case 3: Default case - get all active tasks
    const tasks = await Task.findAll({
      where: { is_active: true },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskAnalytics = async (req, res) => {
  try {
    const analyticsData = {};

    const statusCounts = await Task.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      where: { is_active: true },
      raw: true,
    });
    // console.log(statusCounts);

    analyticsData.statusSummary = {};
    statusCounts.forEach((item) => {
      analyticsData.statusSummary[item.status] = parseInt(item.count, 10);
    });
    //  console.log(analyticsData);

    const allStatuses = ["pending", "in-progress", "completed"];
    allStatuses.forEach((status) => {
      if (!analyticsData.statusSummary[status]) {
        analyticsData.statusSummary[status] = 0;
      }
    });

    const priorityCounts = await Task.findAll({
      attributes: ["priority", [fn("COUNT", col("id")), "count"]],
      group: ["priority"],
      where: { is_active: true },
      raw: true,
    });

    analyticsData.prioritySummary = {};
    priorityCounts.forEach((item) => {
      analyticsData.prioritySummary[item.priority] = parseInt(item.count, 10);
    });

    const allPriorities = ["Low", "Medium", "High", "Urgent"];
    allPriorities.forEach((priority) => {
      if (!analyticsData.prioritySummary[priority]) {
        analyticsData.prioritySummary[priority] = 0;
      }
    });

    analyticsData.totalActiveTasks = await Task.count({
      where: { is_active: true },
    });

    const now = new Date();
    analyticsData.overdueTasksCount = await Task.count({
      where: {
        expried_date: {
          [Op.lt]: now,
        },
        status: {
          [Op.notIn]: ["completed"],
        },
        is_active: true,
      },
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    analyticsData.tasksDueSoonCount = await Task.count({
      where: {
        expried_date: {
          [Op.between]: [now, sevenDaysFromNow],
        },
        status: {
          [Op.notIn]: ["completed"],
        },
        is_active: true,
      },
    });

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching task analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserTaskAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required for task analytics." });
    }

    const analyticsData = {};

    const baseWhereClause = {
      created_by: userId,
      is_active: true,
    };

    const statusCounts = await Task.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      where: baseWhereClause,
      raw: true,
    });

    analyticsData.statusSummary = {};
    statusCounts.forEach((item) => {
      analyticsData.statusSummary[item.status] = parseInt(item.count, 10);
    });

    const allStatuses = ["pending", "in-progress", "completed"];
    allStatuses.forEach((status) => {
      if (!analyticsData.statusSummary[status]) {
        analyticsData.statusSummary[status] = 0;
      }
    });

    const priorityCounts = await Task.findAll({
      attributes: ["priority", [fn("COUNT", col("id")), "count"]],
      group: ["priority"],
      where: baseWhereClause,
      raw: true,
    });

    analyticsData.prioritySummary = {};
    priorityCounts.forEach((item) => {
      analyticsData.prioritySummary[item.priority] = parseInt(item.count, 10);
    });

    const allPriorities = ["Low", "Medium", "High", "Urgent"];
    allPriorities.forEach((priority) => {
      if (!analyticsData.prioritySummary[priority]) {
        analyticsData.prioritySummary[priority] = 0;
      }
    });

    analyticsData.totalActiveTasks = await Task.count({
      where: baseWhereClause,
    });

    const now = new Date();
    analyticsData.overdueTasksCount = await Task.count({
      where: {
        ...baseWhereClause,
        expried_date: {
          [Op.lt]: now,
        },
        status: {
          [Op.notIn]: ["completed"],
        },
      },
    });

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    analyticsData.tasksDueSoonCount = await Task.count({
      where: {
        ...baseWhereClause,
        expried_date: {
          [Op.between]: [now, sevenDaysFromNow],
        },
        status: {
          [Op.notIn]: ["completed"],
        },
      },
    });

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error(
      `Error fetching task analytics for user ${req.params.userId}:`,
      error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const task = await Task.findOne({
      where: { id, is_active: true, created_by: userId },
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: { id, is_active: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // await task.destroy();
    await task.update({ is_active: false });
    res
      .status(200)
      .json({ message: "Task deleted successfully (soft delete)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, expried_date, status } = req.body;
  try {
    const task = await Task.findOne({
      where: { id, is_active: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await task.update({
      title,
      description,
      expried_date,
      status,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
  updateTask,
  getTaskAnalytics,
  getUserTaskAnalytics,
};
