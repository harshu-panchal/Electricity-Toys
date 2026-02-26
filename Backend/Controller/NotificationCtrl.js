import Notification from "../Models/NotificationModel.js";
import User from "../Models/AuthModel.js";

/* ================= GET USER NOTIFICATIONS ================= */
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find personal notifications OR global broadcasts that aren't deleted by this user
        const notifications = await Notification.find({
            $or: [
                // Personal notifications visible to the user
                { userId, isAdmin: false, isDeleted: false },
                // Global broadcasts not deleted by user AND not globally deleted by admin
                { isBroadcastHistory: true, isDeleted: false, deletedBy: { $ne: userId } }
            ]
        }).sort({ createdAt: -1 });

        // Map notifications to include a user-specific 'isRead' flag for broadcasts
        const processedNotifs = notifications.map(notif => {
            const n = notif.toObject();
            if (n.isBroadcastHistory) {
                n.isRead = n.readBy?.some(id => id.toString() === userId.toString()) || false;
            }
            return n;
        });

        res.json({ success: true, notifications: processedNotifs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GET ADMIN NOTIFICATIONS ================= */
export const getAdminNotifications = async (req, res) => {
    try {
        // Fetch notifications meant for admin
        const notifications = await Notification.find({ isAdmin: true, isDeleted: false })
            .sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GET ADMIN BROADCASTS (Sent by Admin) ================= */
export const getAdminBroadcasts = async (req, res) => {
    try {
        // Only fetch the "History" records for the admin dashboard
        const notifications = await Notification.find({ isBroadcastHistory: true, isDeleted: false })
            .sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= MARK AS READ ================= */
export const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ success: false, message: "Not found" });

        if (notif.isBroadcastHistory) {
            // Add user to readBy array for global notifications
            await Notification.findByIdAndUpdate(req.params.id, {
                $addToSet: { readBy: req.user._id }
            });
        } else {
            // Standard personal notification
            await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        }

        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DELETE NOTIFICATION (Soft Delete) ================= */
export const deleteNotification = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ success: false, message: "Not found" });

        // If admin tries to delete a user-specific ORDER notification, ignore on user side
        if (req.user.role === 'admin' && notif.type === 'order' && notif.userId && !notif.isBroadcastHistory) {
            return res.json({ success: true, message: "Admin-only removal ignored for user notifications" });
        }

        if (notif.isBroadcastHistory && req.user.role !== 'admin') {
            // User side: Just hide from them (add to deletedBy)
            await Notification.findByIdAndUpdate(req.params.id, {
                $addToSet: { deletedBy: req.user._id }
            });
        } else {
            // Admin side OR personal notification: Full soft delete
            await Notification.findByIdAndUpdate(req.params.id, { isDeleted: true });
        }

        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DELETE ALL FOR CURRENT USER ================= */
export const deleteAllForUser = async (req, res) => {
    try {
        const userId = req.user._id;
        // Soft delete all personal notifications for this user
        await Notification.updateMany(
            { userId, isAdmin: false, isDeleted: false },
            { $set: { isDeleted: true } }
        );
        // Hide all broadcast notifications for this user only
        await Notification.updateMany(
            { isBroadcastHistory: true },
            { $addToSet: { deletedBy: userId } }
        );
        res.json({ success: true, message: "All notifications cleared for user" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/* ================= DELETE ALL ADMIN NOTIFICATIONS (Soft Delete) ================= */
export const deleteAllAdminNotifications = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { isAdmin: true };

        if (type === 'admin') {
            // Clean admin BROADCAST history
            query = { isBroadcastHistory: true };
        }

        await Notification.updateMany(query, { isDeleted: true });
        res.json({ success: true, message: "Notifications cleared (hidden)" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= ADMIN: CREATE NOTIFICATION FOR USERS ================= */
export const adminCreateNotification = async (req, res) => {
    try {
        const { title, message, type, userId } = req.body;

        if (userId) {
            // Target specific user (Single Record)
            const notif = await Notification.create({
                userId,
                title,
                message,
                type: type || 'admin',
                isAdmin: false
            });
            if (req.io) req.io.to(userId.toString()).emit("notification", notif);
            return res.json({ success: true, notification: notif });
        } else {
            // GLOBAL BROADCAST: Create ONLY 1 Entry for everyone
            const broadcast = await Notification.create({
                title,
                message,
                type: 'admin',
                isAdmin: false,
                isBroadcastHistory: true
            });

            // Emit via socket to all users
            if (req.io) {
                req.io.emit("notification", broadcast);
            }

            return res.json({ success: true, notification: broadcast });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= HELPER: CREATE & EMIT ================= */
export const createNotificationHelper = async (data, io) => {
    // data: { userId, title, message, type, isAdmin }
    try {
        console.log("📢 Creating notification:", JSON.stringify(data, null, 2));

        const notif = await Notification.create(data);
        console.log("✅ Notification saved to DB:", notif._id);

        if (io) {
            if (data.isAdmin) {
                console.log("📤 Emitting admin-notification event");
                io.emit("admin-notification", notif);
            } else if (data.userId) {
                console.log(`📤 Emitting notification to user room: ${data.userId.toString()}`);
                io.to(data.userId.toString()).emit("notification", notif);
            }
        } else {
            console.warn("⚠️ Socket.io instance not available, notification not emitted via socket");
        }

        return notif;
    } catch (error) {
        console.error("❌ Create Notification Error:", error);
    }
};
