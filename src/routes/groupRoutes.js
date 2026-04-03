const { group, error } = require("console");
const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.get("/", (req, res) => {
    try{
        const groupPath = path.join(__dirname, "../data/groups.txt");
        const groups = fs
        .readFileSync(groupPath, "utf8")
        .split("\n")
        .map(group => group.trim()) //xóa khoảng trắng và xóa luôn \r
        .filter(group => group !== "");
        res.json({
            success: true,
            total: groups.length,
            data: groups
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi đọc file group",
            error: error.message
        })
    }
})

module.exports = router