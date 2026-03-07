const express = require("express");
const router = express.Router();
const roleCheck = require("../middleware/roleCheck");
const { sendSlackNotification } = require("../utils/notifications");

// Simulated system state
let bannedIPs = [];

router.post("/execute", roleCheck(["admin", "analyst"]), async (req, res) => {
    const { command } = req.body;
    const operator = req.user.username || "UNKNOWN_OPERATOR";

    console.log(`📡 SOC_TERMINAL: Received command '${command}' from user '${operator}'`);

    const parts = command.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let response = "";
    let status = "SUCCESS";

    switch (cmd) {
        case "help":
            response = "AVAILABLE_PROTOCOLS: ban [ip], unban [ip], status, clear-logs, shutdown-node [node_id], notify [msg]";
            break;
        case "ban":
            if (!args[0]) {
                response = "ERROR: IP_REQUIRED";
                status = "FAILED";
            } else {
                bannedIPs.push(args[0]);
                response = `FIREWALL_LOCK_ACTIVE: ${args[0]} has been purged from node-access.`;
                sendSlackNotification(`🛡️ *FIREWALL_UPDATE*: IP ${args[0]} banned by ${operator}`);
            }
            break;
        case "unban":
            bannedIPs = bannedIPs.filter(ip => ip !== args[0]);
            response = `ACCESS_RESTORED: ${args[0]} node is now operational.`;
            break;
        case "status":
            response = `GRID_STABLE // BANNED_NODES: ${bannedIPs.length} // AI_CORE: ACTIVE // SOC_CLEAN: TRUE // UPTIME: ${Math.floor(process.uptime())}s`;
            break;
        case "notify":
            const msg = args.join(" ");
            sendSlackNotification(`📣 *OPERATOR_MESSAGE* (${operator}): ${msg}`);
            response = "COMMUNICATION_RELAYED: Message broadcasted to Slack/Email.";
            break;
        case "clear-logs":
            response = "LOG_PURGED: Buffer cleared successfully.";
            break;
        default:
            response = `ACCESS_ERROR: Protocol '${cmd}' not found in SG_CORE.`;
            status = "ERROR";
    }

    res.json({
        output: response,
        status: status,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
