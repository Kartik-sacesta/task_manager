const express = require("express");
const router = express.Router();

const {
  createSubcategory,
  getAllSubcategories,
  softDeleteSubcategory,
  restoreSubcategory,
  getAllSubcategoriesById,
  updateSubcategory
} = require("../controllers/subcategorycontroller");

router.post("/", createSubcategory);
router.get("/", getAllSubcategories);
router.get("/:id",getAllSubcategoriesById);
router.delete("/:id", softDeleteSubcategory);
router.put("/:id", updateSubcategory);

module.exports = router;
