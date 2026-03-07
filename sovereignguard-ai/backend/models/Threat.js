const mongoose = require("mongoose");

const ThreatSchema = new mongoose.Schema({
    type: String,
    severity: String,
    ip: String,
    time: Date
});

module.exports = mongoose.model("Threat", ThreatSchema);