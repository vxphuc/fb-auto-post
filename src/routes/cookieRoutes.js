const express = require("express");
const router = express.Router();

const Cookie = require("../models/Cookie");

router.get("/", async (req, res) => {
    try {
        const cookies = await Cookie.find().sort({ createdAt: -1 });

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
});
router.post("/", async (req, res) => {
    try {
        const { name, value, domain, path } = req.body;

        if (!name || !value) {
            return res.status(400).json({
                success: false,
                message: "Tên cookie và value không được để trống"
            });
        }

        const newCookie = await Cookie.create({
            name: name.trim(),
            value: value.trim(),
            domain: domain || ".facebook.com",
            path: path || "/"
        });

        res.json({
            success: true,
            message: "Thêm cookie thành công",
            data: newCookie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi thêm cookie",
            error: error.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { name, value, domain, path } = req.body;

        const updatedCookie = await Cookie.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                value: value.trim(),
                domain: domain || ".facebook.com",
                path: path || "/"
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            message: "Cập nhật cookie thành công",
            data: updatedCookie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật cookie",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Cookie.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Xóa cookie thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi xóa cookie",
            error: error.message
        });
    }
});
module.exports = router;