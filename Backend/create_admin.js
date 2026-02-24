import mongoose from 'mongoose';
import User from './Models/AuthModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const email = "vishalpatel581012@gmail.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = await User.findOneAndUpdate(
            { email },
            {
                fullName: "Vishal Patel",
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log("Admin account created/updated successfully:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${adminUser.role}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
