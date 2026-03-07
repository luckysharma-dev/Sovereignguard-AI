const axios = require("axios");
const nodemailer = require("nodemailer");

const sendSlackNotification = async (message) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes("YOUR/WEBHOOK")) return;

    try {
        await axios.post(webhookUrl, { text: `🚨 *SovereignGuard AI ALERT* 🚨\n${message}` });
        console.log("Slack notification sent.");
    } catch (err) {
        console.error("Slack notification failed:", err.message);
    }
};

const sendEmailNotification = async (subject, text) => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === "your_email_password") return;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: `"SovereignGuard SOC" <${process.env.EMAIL_USER}>`,
            to: process.env.NOTIFICATION_RECEIVER,
            subject: subject,
            text: text,
            html: `<b>🚨 SovereignGuard AI SOC Alert</b><br><p>${text}</p>`
        });
        console.log("Email notification sent.");
    } catch (err) {
        console.error("Email notification failed:", err.message);
    }
};

const notifyCriticalThreat = async (threatType, riskScore) => {
    const alertMsg = `CRITICAL THREAT DETECTED: ${threatType.toUpperCase()} with a risk score of ${riskScore}%! Immediate action required.`;

    // Send to Slack
    await sendSlackNotification(alertMsg);

    // Send to Email
    await sendEmailNotification(`🚨 CRITICAL THREAT: ${threatType}`, alertMsg);
};

module.exports = { notifyCriticalThreat, sendSlackNotification, sendEmailNotification };
