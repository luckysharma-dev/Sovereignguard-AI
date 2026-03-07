const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const router = express.Router();
const AIAnalysis = require("../models/AIAnalysis");
const roleCheck = require("../middleware/roleCheck");
const { notifyCriticalThreat } = require("../utils/notifications");

// Helper function to call Python AI Engine
const getAIPrediction = (data) => {
    return new Promise((resolve, reject) => {
        const pythonPath = path.join(__dirname, "../../../.venv/Scripts/python.exe");
        const scriptPath = path.join(__dirname, "../../ai_engine/threat_prediction.py");
        const inputData = JSON.stringify(data);

        exec(`"${pythonPath}" "${scriptPath}" "${inputData}"`, (error, stdout, stderr) => {
            if (error) {
                console.error("AI execution error:", error);
                return reject(error);
            }
            try {
                const result = JSON.parse(stdout);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    });
};

// Only Admin and Analyst can trigger live predictions
router.get("/prediction", roleCheck(["admin", "analyst"]), async (req, res) => {
    try {
        const currentData = {
            ddos: [15, 85, 12], // CRITICAL
            brute_force: [12, 20, 8], // PERSISTENT
            phishing: [3, 10, 2], // LOW
            sql_injection: [5, 25, 4] // MODERATE
        };

        const results = [
            { attack: "DDoS", features: currentData.ddos },
            { attack: "Brute Force", features: currentData.brute_force },
            { attack: "Phishing", features: currentData.phishing },
            { attack: "SQL Injection", features: currentData.sql_injection }
        ];

        const predictionPromises = results.map(async (item) => {
            const prediction = await getAIPrediction(item.features);

            // Trigger notification if risk score is > 80%
            if (prediction.risk_score > 80) {
                await notifyCriticalThreat(item.attack, prediction.risk_score);
            }

            // Store results in MongoDB for historical analysis
            const record = new AIAnalysis({
                attack_type: item.attack,
                risk_score: prediction.risk_score,
                status: prediction.status,
                features_used: {
                    failed_logins: item.features[0],
                    traffic_spike: item.features[1],
                    suspicious_ips: item.features[2]
                }
            });
            await record.save();

            return { attack: item.attack, risk: prediction.risk_score, status: prediction.status };
        });

        const finalResults = await Promise.all(predictionPromises);
        res.json(finalResults);
    } catch (err) {
        console.error("AI API Error:", err);
        res.status(500).json({ error: "AI Engine connection failed" });
    }
});

module.exports = router;
