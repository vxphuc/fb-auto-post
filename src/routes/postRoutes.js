const express = require("express");
const router = express.Router();
const runBot = require("../bot/runBot");

router.post("/start", async (req, res) => {
    try {
        runBot().catch(error => {
            console.error("Lỗi bot:", error.message);
        });

        res.json({
            success: true,
            message: "Bot đã bắt đầu chạy"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi bắt đầu đăng bài",
            error: error.message
        });
    }
});

module.exports = router;