const express = require("express");
const router = express.Router();

router.get("/alerts", (req, res) => {
    const threats = [
        { type: "Brute Force Attack", severity: "High" },
        { type: "DDoS Attempt", severity: "Critical" },
        { type: "Suspicious Login", severity: "Medium" },
        { type: "SQL Injection Probe", severity: "High" },
        { type: "Malware Communication", severity: "Critical" }
    ];

    res.json(threats);
});

router.get("/attacks", (req, res) => {
    // Simulated coordinate-based attacks targeting India [77, 28]
    // Added Detailed Geo-Intel for Map Interaction
    const attacks = [
        {
            source: [-74, 40], target: [77, 28],
            type: "USA → India", severity: "Medium",
            intel: {
                ip: "192.168.4.22",
                org: "CYBER_DYNE_SYSTEMS",
                location: "New York, USA",
                method: "DNS_AMPLIFICATION"
            }
        },
        {
            source: [116, 39], target: [77, 28],
            type: "China → India", severity: "High",
            intel: {
                ip: "202.108.22.45",
                org: "RED_DRAGON_CORP",
                location: "Beijing, China",
                method: "REVERSE_TCP_EXPLOIT"
            }
        },
        {
            source: [37, 55], target: [77, 28],
            type: "Russia → India", severity: "High",
            intel: {
                ip: "95.161.229.11",
                org: "KREMLIN_SHADOW_NET",
                location: "Moscow, Russia",
                method: "SQL_INJECTION_STORM"
            }
        },
        {
            source: [2, 48], target: [77, 28],
            type: "Europe → India", severity: "Medium",
            intel: {
                ip: "82.165.33.102",
                org: "EURO_VOID_ANON",
                location: "Paris, France",
                method: "BRUTE_FORCE_SSH"
            }
        },
        {
            source: [139, 35], target: [77, 28],
            type: "Japan → India", severity: "Low",
            intel: {
                ip: "163.43.24.89",
                org: "NEO_TOKYO_HACK_LAB",
                location: "Tokyo, Japan",
                method: "XSS_PROBE"
            }
        }
    ];
    res.json(attacks);
});

module.exports = router;