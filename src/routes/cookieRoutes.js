const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.get("/", (req, res) => {
    try {
        const cookiePath = path.join(__dirname, "../data/cookies.json");

        const cookies = JSON.parse(
        fs.readFileSync(cookiePath, "utf8")
        );

        res.json({
        success: true,
        total: cookies.length,
        data: cookies
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Lỗi đọc cookies",
        error: error.message
        });
    }
})
module.exports = router;