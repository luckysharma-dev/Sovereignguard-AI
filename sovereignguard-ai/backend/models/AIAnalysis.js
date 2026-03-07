const mongoose = require("mongoose");

const AIAnalysisSchema = new mongoose.Schema({
    attack_type: { type: String, required: true },
    risk_score: { type: Number, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    features_used: {
        failed_logins: Number,
        traffic_spike: Number,
        suspicious_ips: Number
    }
});

module.exports = mongoose.model("AIAnalysis", AIAnalysisSchema);
