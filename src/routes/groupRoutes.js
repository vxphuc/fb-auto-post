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

router.put("/:index", (req, res) => {
    try{
        const index = parseInt(req.params.index);
        const { group } = req.body;
        if (!group || group.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Link group không được để trống"
            });
        }
        const groupPath = path.join(__dirname, "../data/groups.txt");
        const groups = fs.readFileSync(groupPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "")
        if(index < 0 || index >= groups.length){
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy group"
            })
        }
        groups[index] = group.trim();
        fs.writeFileSync(groupPath, groups.join("\n"));
        res.json({
            success: true,
            message: "Cập nhật group thành công",
            data: groups
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật group",
            error: error.message
        });
    }
})

router.delete("/:index", (req, res) => {
    try{
        const index = parseInt(req.params.index);
        const groupPath = path.join(__dirname, "../data/groups.txt");
        const groups = fs.readFileSync(groupPath, "utf8")
            .split("\n")
            .map(item => item.trim)
            .filter(item => item != "");
        if (index < 0 || index >= groups.length) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy group"
            });
        }
        const deleteGroup = groups[index];
        groups.splice(index, 1);
        fs.writeFileSync(groupPath, groups.join("\n"));
        res.json({
            success: true,
            message: "Xóa group thành công.",
            deleted: deleteGroup,
            data: groups
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