const express = require("express");
const router = express.Router();

const Content = require("../models/Content");

router.get("/", async (req, res) => {
    try{
        const contents = await Content.find().sort({ createdAt: -1 })
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

router.post("/", async (req, res) => {
    try{
        const { content } = req.body;
        if(!content || content.trim() === ""){
            return res.status(400).json({
                succes: false,
                message: "Nội dung không được để trống"
            })
        }
        const newContent = await Content.create({
            text: content.trim()
        })
        res.json({
            success: true,
            message: "Thêm nội dung thành công",
            data: newContent
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi thêm nội dung",
            error: error.message
        })
    }
})

router.put("/:id", async (req, res) => {
    try{
        const { content } = req.body;
        if (!content || content.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Nội dung không được để trống"
            });
        }
        const updateContent = await Content.findByIdAndUpdate(
            req.params.id,
            {
                text: content.trim()
            },{
                new: true
            }
        );
        res.json({
            success: true,
            message: "Cập nhật thành công",
            data: updateContent
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật nội dung",
            error: error.message
        });
    }
})

router.delete("/:id", async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Xóa nội dung thành công",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi xóa nội dung",
            error: error.message
        });
    }
});

module.exports = router;