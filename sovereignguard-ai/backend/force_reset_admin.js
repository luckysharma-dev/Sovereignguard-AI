const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect("mongodb://127.0.0.1:27017/sovereignguard");
        console.log("Connected.");

        console.log("Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        console.log("Hashed.");

        console.log("Updating admin account...");
        // Use findOneAndUpdate with hashed password to BYPASS hooks 
        // ensuring we definitely have the right hash in the DB
        await User.findOneAndUpdate(
            { username: "admin" },
            {
                $set: {
                    password: hashedPassword,
                    role: "admin",
                    isTwoFactorEnabled: false
                }
            },
            { upsert: true, new: true }
        );
        console.log("✅ CRITICAL_SUCCESS: Admin updated successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ FAILED:", err);
        process.exit(1);
    }
}
run();
