import express from "express";
import { getContent, updateContent, uploadContentImage } from "../Controller/ContentCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";
import upload from "../Cloudinary/Upload.js";

const router = express.Router();

// Static route MUST come before dynamic /:page route
router.post("/upload/image", AuthMiddleware, isAdmin, upload.single("image"), uploadContentImage);
router.get("/:page", getContent);
router.post("/:page", AuthMiddleware, isAdmin, updateContent);

export default router;
