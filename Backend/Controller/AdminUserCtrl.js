import mongoose, { isValidObjectId } from "mongoose";
import User from "../Models/AuthModel.js";
import Order from "../Models/OrderModel.js";
import Wishlist from "../Models/WishlistModel.js";
import Cart from "../Models/CartModel.js";

export const getAdminUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);

    const filter = { isDeleted: false, role: { $ne: "admin" } };
    const projection = "fullName email phone role createdAt isActive";

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(projection)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(id)
      .select("-password -otp -otpExpire -resetOtp -resetOtpExpire -resetToken -resetTokenExpire")
      .lean();
    if (!user || user.isDeleted || user.role === "admin") {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ userId: id })
      .select("grandTotal paymentStatus createdAt orderStatus products")
      .sort({ createdAt: -1 })
      .lean();

    const orderCount = orders.length;
    const totalSpending = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

    const wishlistCount = await Wishlist.countDocuments({ userId: id });

    const cartAgg = await Cart.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalQty: { $sum: { $ifNull: ["$quantity", 1] } } } }
    ]);
    const cartItemsCount = cartAgg.length ? cartAgg[0].totalQty : 0;

    res.json({
      success: true,
      user,
      orders,
      metrics: {
        orderCount,
        totalSpending,
        wishlistCount,
        cartCount: cartItemsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
