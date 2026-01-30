const express = require("express");
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  upload,
} = require("../../controllers/inventory/itemController");

// Item routes
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", upload.single("itemImage"), createItem);
router.put("/:id", upload.single("itemImage"), updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
