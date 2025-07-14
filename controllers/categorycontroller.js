const Category = require("../model/Category");
const { Op, where } = require("sequelize");
const { head } = require("../routes/authroute");

const handleError = (
  res,
  error,
  message = "Server Error",
  statusCode = 500
) => {
  console.error(message, error);
  res
    .status(statusCode)
    .json({ success: false, message, error: error.message });
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required." });
    }

    const existingCategory = await Category.findOne({ where: { name } });

    if (existingCategory) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Category with this name already exists.",
        });
    }

    const newCategory = await Category.create({
      name,
      description,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Category created successfully.",
        category: newCategory,
      });
  } catch (error) {
    handleError(res, error, "Error creating category.");
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_deleted: false },
      order: [["name", "ASC"]],
    });

    res
      .status(200)
      .json({ success: true, count: categories.length, categories });
  } catch (error) {
    handleError(res, error, "Error fetching categories.");
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await Category.findByPk(id);

    if (!category || category.is_deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found or is deleted." });
    }

    if (name !== undefined && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: {
            [Op.Like]: name,
          },
          id: {
            [Op.ne]: id,
          },
          is_deleted: false,
        },
      });
      if (existingCategory) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Category with this name already exists.",
          });
      }
    }

    await category.update({
      name: name !== undefined ? name : category.name,
      description:
        description !== undefined ? description : category.description,
      is_active: is_active !== undefined ? is_active : category.is_active,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Category updated successfully.",
        category,
      });
  } catch (error) {
    handleError(res, error, "Error updating category.");
  }
};

const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category || category.is_deleted) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Category not found or already deleted.",
        });
    }

    await category.update({ is_deleted: true });

    res
      .status(200)
      .json({ success: true, message: "Category soft-deleted successfully." });
  } catch (error) {
    handleError(res, error, "Error soft-deleting category.");
  }
};

const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { paranoid: false });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    if (!category.is_deleted) {
      return res
        .status(400)
        .json({ success: false, message: "Category is not soft-deleted." });
    }

    await category.update({ is_deleted: false, deletedAt: null });
    res
      .status(200)
      .json({
        success: true,
        message: "Category restored successfully.",
        category,
      });
  } catch (error) {
    handleError(res, error, "Error restoring category.");
  }
};

module.exports = {
  createCategory,
  getAllCategories,

  updateCategory,
  softDeleteCategory,
  restoreCategory,
};
