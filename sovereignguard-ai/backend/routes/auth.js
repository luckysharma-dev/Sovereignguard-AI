require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretSOCkey123";

// REGISTER OPERATOR (With optional Role)
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ error: "Operator already exists" });

        user = new User({ username, password, role: role || "operator" });
        await user.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// LOGIN OPERATOR (Now handles 2FA)
router.post("/login", async (req, res) => {
    console.log(`🔐 LOGIN_ATTEMPT: ${req.body.username}`);
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`❌ LOGIN_FAILED: User '${username}' not found.`);
            return res.status(404).json({ error: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`❌ LOGIN_FAILED: Password mismatch for '${username}'.`);
            return res.status(401).json({ error: "Unauthorized Access" });
        }

        console.log(`✅ LOGIN_SUCCESS: ${username}`);

        // If 2FA enabled, don't return token yet
        if (user.isTwoFactorEnabled) {
            return res.json({ twoFactorRequired: true, userId: user._id });
        }

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
        res.json({ token, username: user.username, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// GENERATE 2FA SECRET (Protected Route)
const auth = require("../middleware/auth");
router.post("/2fa/setup", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const secret = speakeasy.generateSecret({ name: `SovereignGuardAI:${user.username}` });

        user.twoFactorSecret = secret.base32;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            res.json({ qrCode: data_url, secret: secret.base32 });
        });
    } catch (err) {
        res.status(500).json({ error: "2FA Setup Failed" });
    }
});

// VERIFY 2FA (Enable 2FA)
router.post("/2fa/enable", auth, async (req, res) => {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token
    });

    if (verified) {
        user.isTwoFactorEnabled = true;
        await user.save();
        res.json({ message: "2FA ENABLED_SECURELY" });
    } else {
        res.status(400).json({ error: "INVALID_CODE" });
    }
});

// LOGIN VERIFY 2FA
router.post("/login/verify-2fa", async (req, res) => {
    const { userId, token } = req.body;
    const user = await User.findById(userId);

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token
    });

    if (verified) {
        const jwtToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
        res.json({ token: jwtToken, username: user.username, role: user.role });
    } else {
        res.status(400).json({ error: "INVALID_2FA_CODE" });
    }
});

module.exports = router;