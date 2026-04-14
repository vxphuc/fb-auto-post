const { group, error } = require("console");
const express = require("express");
const router = express.Router();

const Group = require("../models/Group")
router.get("/", async (req, res) => {
    try{
        const groups = await Group.find().sort({ createdAt: -1 });

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

router.post("/", async (req, res) => {
    try{
        const { group } = req.body;
        if(!group || group.trim() === ""){
            return res.status(400).json({
                success: false,
                message: "Link group không được để trống"
            })
        }
        const newGroup = await Group.create({
            url: group.trim()
        });
        res.json({
            success: true,
            message: "Thêm group thành công",
            data: newGroup
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi thêm group",
            error: error.message
        })
    }
})

router.put("/:id", async (req, res) => {
    try{
        const { group } = req.body;
        const updateGroup = await Group.findByIdAndUpdate(
            req.params.id,
            {
                url: group.trim()
            },
            {
                new: true
            }
        );
        res.json({
            success: true,
            message: "Cập nhật group thành công",
            data: updateGroup
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật group",
            error: error.message
        });
    }
})

router.delete("/:id", async (req, res) => {
    try{
        await Group.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Xóa group thành công.",
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi xóa group",
            error: error.message
        });
    }
})

module.exports = router