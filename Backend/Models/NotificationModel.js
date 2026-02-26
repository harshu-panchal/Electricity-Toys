import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Optional - admin notifications don't have userId
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["order", "system", "promotion", "admin"],
            default: "system",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isAdmin: { // For admin notifications
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isBroadcastHistory: { // For shared global messages
            type: Boolean,
            default: false
        },
        readBy: [{ // Users who have read this global notification
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        deletedBy: [{ // Users who have deleted this global notification
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        referenceId: { // To link to orders, products, etc.
            type: String,
            required: false
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Notification", notificationSchema);
