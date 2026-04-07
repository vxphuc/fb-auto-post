const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "src/data/images");
    },
    filename: function (req, file, cb){
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName)
    }
});

const upload = multer({storage});

router.get("/", (req, res) => {
    try{
        const imagePath = path.join(__dirname, "../data/images");
        const files = fs.readdirSync(imagePath);
        res.json({
            success: true,
            total: files.length,
            data: files
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi đọc danh sách ảnh",
            error: error.message
        });
    }
})

router.post("/upload", upload.array("images", 20), (req, res) =>{
    try{
        res.json({
            success: true,
            message: "Upload thành công",
            total: req.files.length,
            data: req.files
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Upload thất bại",
            error: error.message
        })
    }
});
module.exports = router;