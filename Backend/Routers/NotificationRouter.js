import express from "express";
import {
    getUserNotifications,
    getAdminNotifications,
    getAdminBroadcasts,
    markAsRead,
    deleteNotification,
    deleteAllAdminNotifications,
    deleteAllForUser,
    adminCreateNotification
} from "../Controller/NotificationCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", AuthMiddleware, getUserNotifications);
router.get("/admin", AuthMiddleware, isAdmin, getAdminNotifications);
router.get("/admin/broadcasts", AuthMiddleware, isAdmin, getAdminBroadcasts);
router.post("/admin/send", AuthMiddleware, isAdmin, adminCreateNotification);
router.delete("/admin/clear-all", AuthMiddleware, isAdmin, deleteAllAdminNotifications);
router.delete("/clear-all", AuthMiddleware, deleteAllForUser);
router.put("/:id/read", AuthMiddleware, markAsRead);
router.delete("/:id", AuthMiddleware, deleteNotification);

export default router;
