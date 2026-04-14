const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");
const Image = require("../models/Image");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "fb-auto-post",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            total: images.length,
            data: images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi đọc danh sách ảnh",
            error: error.message
        });
    }
});

router.post("/upload", upload.array("images", 20), async (req, res) => {
    try {
        const savedImages = [];

        for (const file of req.files) {
            const newImage = await Image.create({
                fileName: file.filename,
                originalName: file.originalname,
                imageUrl: file.path,
                publicId: file.filename
            });

            savedImages.push(newImage);
        }

        res.json({
            success: true,
            message: "Upload ảnh thành công",
            total: savedImages.length,
            data: savedImages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload ảnh thất bại",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Ảnh không tồn tại"
            });
        }

        await cloudinary.uploader.destroy(image.publicId);

        await Image.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Xóa ảnh thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Xóa ảnh thất bại",
            error: error.message
        });
    }
});

module.exports = router;