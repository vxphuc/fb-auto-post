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

router.post("/", (req, res) => {
    try{
        const { group } = req.body;
        if(!group || group.trim() === ""){
            return res.status(400).json({
                success: false,
                message: "Link group không được để trống"
            })
        }
        const groupPath = path.join(__dirname, "../data/groups.txt");
        fs.appendFileSync(groupPath, "\n" + group.trim());
        res.json({
            success: true,
            message: "Thêm group thành công"
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi thêm group",
            error: error.message
        })
    }
})

module.exports = router