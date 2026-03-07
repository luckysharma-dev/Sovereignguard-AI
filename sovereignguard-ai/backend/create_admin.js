const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sovereignguard");
        console.log("Connected to MongoDB...");

        const existingUser = await User.findOne({ username: "admin" });
        if (existingUser) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const adminUser = new User({
            username: "admin",
            password: "password123", // Will be hashed by pre-save hook
            role: "admin"
        });

        await adminUser.save();
        console.log("✅ Admin User Created: admin / password123");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();
