const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  
  softDeleteCategory,
  restoreCategory,
  updateCategory,

} = require("../controllers/categorycontroller");

router.post("/", createCategory);
router.get("/", getAllCategories);
router.delete("/:id", softDeleteCategory);
router.put("/:id", updateCategory);

module.exports = router;
