import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../Controller/CategoryCtrl.js";

import upload  from "../Cloudinary/Upload.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/create", AuthMiddleware, isAdmin, upload.single("image"), createCategory); // Protected - Admin only
router.get("/create", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Method not allowed",
    data: null
  });
});
router.get("/all", getAllCategories); // Public - Anyone can view categories
router.get("/:id", getCategoryById); // Public - Anyone can view category details
router.put("/update/:id", AuthMiddleware, isAdmin, upload.single("image"), updateCategory); // Protected - Admin only
router.delete("/delete/:id", AuthMiddleware, isAdmin, deleteCategory); // Protected - Admin only

export default router;
