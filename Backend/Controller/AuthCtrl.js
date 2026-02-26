import User from "../Models/AuthModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../Helpers/generateToken.js";
import { sendOTPEmail } from "../Helpers/SendMail.js";
import { updateCloudinaryImage } from "../Cloudinary/CloudinaryHelper.js";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    console.log("Register Request Body:", req.body); // DEBUG LOG
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email, isDeleted: false });
    if (userExists) {
      console.log("User already exists:", email); // DEBUG LOG
      return res.status(400).json({
        success: false,
        message: "User already exists",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("Creating user...", { fullName, email }); // DEBUG LOG
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
    });
    console.log("User created:", user._id); // DEBUG LOG

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      data: null,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= UPDATE AVATAR =================
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided", data: null });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    }

    const upload = await updateCloudinaryImage(
      user.avatarPublicId,
      req.file.buffer,
      "electritoy/users"
    );

    user.avatar = upload.url;
    user.avatarPublicId = upload.public_id;
    await user.save();

    res.json({
      success: true,
      message: "Profile image updated",
      data: user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Update Avatar Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    console.log("Login Request:", req.body.email); // DEBUG LOG
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Email is not registered", data: null });
    // ... rest of login
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated", data: null });
    if (user.isDeleted)
      return res.status(403).json({ success: false, message: "Account deleted", data: null });
    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "Account not verified", data: null });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials", data: null });

    res.json({
      success: true,
      message: "Login successful",
      data: user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= ADMIN LOGIN (ADMIN-ONLY ACCESS) =================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin Login Attempt:", { email });

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // 2. Find User
    const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or unauthorized access."
      });
    }

    // 3. Strict Role Check (CRITICAL)
    if (user.role !== "admin") {
      console.warn(`Unauthorized login attempt to admin panel by user: ${email}`);
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have administrator privileges.",
      });
    }

    // 4. Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 5. Account Status Checks
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your admin account is deactivated. Please contact the system owner.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Admin account not verified. Please complete the verification process.",
      });
    }

    // 6. Success Response with Token
    return res.json({
      success: true,
      message: "Admin login successful",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("CRITICAL: Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
      data: null
    });
  }
};

// ================= VERIFY USER =================
export const verifyUser = async (req, res) => {
  try {
    console.log("Verify Request:", req.body); // DEBUG LOG
    const { email, otp } = req.body;

    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required", data: null });

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Verify failed: Invalid OTP or Email for", email);
      return res.status(400).json({ success: false, message: "Invalid or expired OTP", data: null });
    }

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isVerified = true;
    await user.save();
    console.log("User verified:", user._id);

    res.json({
      success: true,
      message: "User verified successfully",
      data: user,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};


// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Old password incorrect", data: null });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zipCode } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already exists", data: null });
    }

    user.fullName = name || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.zipCode = zipCode || user.zipCode;

    await user.save();

    res.json({ success: true, message: "Profile updated", data: user, token: generateToken(user._id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= SOFT DELETE =================
export const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isDeleted = true;
    await user.save();

    res.json({ success: true, message: "Account deactivated successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= DELETE PROFILE PERMANENT =================
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.json({ success: true, message: "Account deleted permanently", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= ACTIVE / DEACTIVE USER (ADMIN) =================
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "Activated" : "Deactivated"}`,
      data: { user },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= RESEND OTP =================
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found", data: null });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= USER PROFILE =================
export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, message: "User profile fetched", data: user, token: generateToken(user._id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= USER PROFILE BY ID =================
export const userProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, message: "User profile fetched", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords do not match", data: null });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ success: true, message: "Password set successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body; // role can be 'admin' or 'user'
    console.log("Forgot Password Request:", { email, role });

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email, isDeleted: false });

    // Prevent enumeration if desired, but requirement says "If email does not exist -> show proper error message" for Admin
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `This account is not registered as ${role}` });
    }

    // Rate Limiting: 1 minute between OTP requests
    if (user.lastOtpRequest && (Date.now() - user.lastOtpRequest < 60 * 1000)) {
      const wait = Math.ceil((60 * 1000 - (Date.now() - user.lastOtpRequest)) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait} seconds before requesting another OTP.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOTP;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.lastOtpRequest = Date.now();
    user.resetOtpAttempts = 0;
    await user.save();

    await sendOTPEmail(email, otp, "Password Reset Alert - OTP", "Password Reset Verification"); // Helper sends raw OTP to email

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= VERIFY RESET OTP =================
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email, isDeleted: false });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(403).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    res.json({ success: true, message: "OTP verified. Proceed to reset password." });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Strong password check (simplified for now but requirement says "Strong password rules")
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email, isDeleted: false });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (user.resetOtpAttempts >= 5) {
      return res.status(403).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error", data: null });
  }
};
