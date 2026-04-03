const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.get("/", (req, res) => {
    try{
        const contentPath = path.join(__dirname, "../data/post.txt");
        const contents = fs
            .readFileSync(contentPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");
        res.json({
            succes: true,
            total: contents.length,
            data: contents
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi đọc nội dung bài viết",
            error: error.message
        });
    }
})
module.exports = router;