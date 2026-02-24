import mongoose from 'mongoose';

const sourceUri = "mongodb+srv://mohammadrehan00121_db_user:6gC8ISaBFJNgoiWo@cluster0.jjlorc0.mongodb.net/ElectriciToys";

async function test() {
    console.log("Testing connection to SOURCE...");
    try {
        await mongoose.connect(sourceUri);
        console.log("✅ Source connected!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Source failed:", err.message);
    }
}
test();
