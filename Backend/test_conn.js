import mongoose from 'mongoose';

const uri = "mongodb+srv://electricitoyshub_db_user:MSvD28mANAA36x0o@electricitytoy.xcmovhr.mongodb.net/?appName=ElectricityToy";

async function test() {
    console.log("Testing connection to target with Mongoose...");
    try {
        await mongoose.connect(uri);
        console.log("✅ Mongoose connected successfully!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Mongoose failed:", err.message);
    }
}
test();
