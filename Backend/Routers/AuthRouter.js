import express from "express";
import {
    registerUser,
    loginUser,
    adminLogin,
    verifyUser,
    changePassword,
    updateProfile,
    updateAvatar,
    softDeleteUser,
    deleteProfile,
    toggleUserStatus,
    resendOTP,
    userProfile,
    userProfileById,
    setPassword,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
} from "../Controller/AuthCtrl.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";
import upload from "../Cloudinary/Upload.js";

const router = express.Router();

// Admin 
router.post("/register", registerUser);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/admin-login", adminLogin); // New merged login/register route
router.post("/verify", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

router.post("/change-password", AuthMiddleware, changePassword);
router.post("/setPassword", AuthMiddleware, setPassword);
router.put("/update-profile", AuthMiddleware, updateProfile);
router.put("/update-avatar", AuthMiddleware, upload.single("avatar"), updateAvatar);
router.get("/profile", AuthMiddleware, userProfile);
router.delete("/soft-delete", AuthMiddleware, softDeleteUser);


// User

router.delete("/delete-profile/:id", AuthMiddleware, isAdmin, deleteProfile);
router.put("/toggle-status/:id", AuthMiddleware, isAdmin, toggleUserStatus);
router.get("/userProfile/:id", AuthMiddleware, isAdmin, userProfileById);


export default router;
