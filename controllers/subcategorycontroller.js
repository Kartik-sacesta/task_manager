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
      return res
        .status(409)
        .json({
          success: false,
          message: "Sub Category with this name already exists.",
        });
    }

    const newSubcategory = await Subcategory.create({
      name,
      description,
      category_id,
    });

    res
      .status(201)
      .json({
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
    const {id}=req.params;
  try {
    const subcategories = await Subcategory.findAll({
      where: { is_deleted: false ,category_id:id},
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
        .json({ success: false, message: "Category not found or is deleted." });
    }

    if (name !== undefined && name !== category.name) {
      const existingCategory = await Subcategory.findOne({
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

    await Subcategory.update({
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

const softDeleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Subcategory.findByPk(id);

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

const restoreSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Subcategory.findByPk(id, { paranoid: false });

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
createSubcategory,
getAllSubcategories,
updateSubcategory,
softDeleteSubcategory,
restoreSubcategory,
getAllSubcategoriesById

};
