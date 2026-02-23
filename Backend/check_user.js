import Link from 'mongoose';
import User from './Models/AuthModel.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const checkSpecificUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const users = await User.find({});
        console.log(`Total users found: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role}, Verified: ${u.isVerified}, Active: ${u.isActive})`);
        });
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}
checkSpecificUser();
