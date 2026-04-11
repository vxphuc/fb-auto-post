const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.get("/", (req, res) => {
    try{
        const settingsPath = path.join(__dirname, "../data/settings.json");
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        res.json({
            success: true,
            data: settings
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi đọc settings",
            error: error.message
        });
    }
})

router.put("/:index", (req, res) =>{
    try{
        const settingsPath = path.join(__dirname, "../data/settings.json");
        const newSettings = req.body;
        fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
        res.json({
            success: true,
            message: "Cập nhật settings thành công",
            data: newSettings
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật settings",
            error: error.message
        });
    }
})

module.exports = router;