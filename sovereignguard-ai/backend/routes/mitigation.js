const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sendSlackNotification } = require("../utils/notifications");

// Simulated mitigation history
let mitigationLogs = [];

router.post("/mitigate", auth, (req, res) => {
    const { threatType } = req.body;

    // Simulate active defense action
    const log = {
        action: `NEUTRALIZED_${threatType.toUpperCase()}`,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        operator: req.user.username || req.user.id
    };

    mitigationLogs.unshift(log);

    const msg = `🛡️ *ACTIVE DEFENSE EXECUTED*: ${log.action}\n👤 *OPERATOR*: ${log.operator}`;
    sendSlackNotification(msg);

    console.log(`⚔️ ACTIVE_DEFENSE_ACTION: ${log.action} by ${log.operator}`);

    res.json({
        message: `PROTOCOL_EXECUTED: ${threatType} HAS_BEEN_NEUTRALIZED`,
        details: log
    });
});

router.get("/mitigation-logs", auth, (req, res) => {
    res.json(mitigationLogs.slice(0, 5));
});

module.exports = router;
