const Subcategory = require("../model/SubCategory");
const { Op, where } = require("sequelize");

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

const createSubcategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "sub Category name is required." });
    }

    const existingSubcategory = await Subcategory.findOne({ where: { name } });

    if (existingSubcategory) {
      return res.status(409).json({
        success: false,
        message: "Sub Category with this name already exists.",
      });
    }

    const newSubcategory = await Subcategory.create({
      name,
      description,
      category_id,
    });

    res.status(201).json({
      success: true,
      message: "Sub Category created successfully.",
      Subcategory: newSubcategory,
    });
  } catch (error) {
    handleError(res, error, "Error creating category.");
  }
};

const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.findAll({
      where: { is_deleted: false },
      order: [["name", "ASC"]],
    });

    res
      .status(200)
      .json({ success: true, count: subcategories.length, subcategories });
  } catch (error) {
    handleError(res, error, "Error fetching categories.");
  }
};

const getAllSubcategoriesById = async (req, res) => {
  const { id } = req.params;
  try {
    const subcategories = await Subcategory.findAll({
      where: { is_deleted: false, category_id: id },
      order: [["name", "ASC"]],
    });

    res
      .status(200)
      .json({ success: true, count: subcategories.length, subcategories });
  } catch (error) {
    handleError(res, error, "Error fetching categories.");
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await Subcategory.findByPk(id);

    if (!category || category.is_deleted) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Sub Category not found or is deleted.",
        });
    }
    if (name !== undefined && name !== category.name) {
      const existingSubcategory = await Subcategory.findOne({
        where: { name },
      });

      if (existingSubcategory && existingSubcategory.id !== category.id) {
        return res.status(409).json({
          success: false,
          message: "Sub Category with this name already exists.",
        });
      }
    }

    if (name !== undefined) {
      category.name = name;
    }
    if (description !== undefined) {
      category.description = description;
    }
    if (is_active !== undefined) {
      category.is_active = is_active;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Sub Category updated successfully.",
      category: category,
    });
  } catch (error) {
    handleError(res, error, "Error updating sub category.");
  }
};

const softDeleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Subcategory.findByPk(id);

    if (!category || category.is_deleted) {
      return res.status(404).json({
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

module.exports = {
  createSubcategory,
  getAllSubcategories,
  updateSubcategory,
  softDeleteSubcategory,

  getAllSubcategoriesById,
};
