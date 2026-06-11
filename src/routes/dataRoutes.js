const express = require("express");
const router = express.Router();

const { loadBotData } = require("../utils/dataLoader");

router.get("/", async (req, res) => {
    try {
        const data = await loadBotData();

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi đọc dữ liệu từ thư mục data",
            error: error.message
        });
    }
});

module.exports = router;
