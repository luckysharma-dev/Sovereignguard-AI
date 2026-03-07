require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./config/db"); // MongoDB Connection
const app = express();

const authRoutes = require("./routes/auth");
const alertRoutes = require("./routes/alerts");
const predictionRoutes = require("./routes/prediction");
const mitigationRoutes = require("./routes/mitigation");
const terminalRoutes = require("./routes/terminal"); // Add this

const auth = require("./middleware/auth"); // Authentication middleware
const roleCheck = require("./middleware/roleCheck"); // RBAC middleware

app.use(cors());
app.use(express.json());

// Public Routes
app.use("/api/auth", authRoutes);

// Protected SOC Routes (Require JWT)
app.use("/api", auth, alertRoutes);

// RBAC: Prediction only for admin or analyst
app.use("/api", auth, roleCheck(["admin", "analyst"]), predictionRoutes);

// RBAC: Mitigation only for admin or analyst
app.use("/api", auth, roleCheck(["admin", "analyst"]), mitigationRoutes);

// RBAC: Terminal Console only for admin or analyst
app.use("/api/terminal", auth, terminalRoutes);

// RBAC: Historical data only for admin
app.get("/api/analysis", auth, roleCheck(["admin"]), async (req, res) => {
    try {
        const AIAnalysis = require("./models/AIAnalysis");
        const history = await AIAnalysis.find().sort({ timestamp: -1 }).limit(50);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch historical analysis" });
    }
});

app.get("/", (req, res) => {
    res.send("SovereignGuard AI Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});