import express from "express";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";
import { getAdminUsers, getAdminUserById } from "../Controller/AdminUserCtrl.js";

const router = express.Router();

router.get("/", AuthMiddleware, isAdmin, getAdminUsers);
router.get("/:id", AuthMiddleware, isAdmin, getAdminUserById);

export default router;
