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

router.post("/", (req, res) => {
    try{
        const { content } = req.body;
        if(!content || content.trim() === ""){
            return res.status(400).json({
                succes: false,
                message: "Nội dung không được để trống"
            })
        }
        const contentPath = path.join(__dirname, "../data/post.txt");
        fs.appendFileSync(contentPath, "\n" + content.trim());
        res.json({
            success: true,
            message: "Thêm nội dung thành công"
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi thêm nội dung",
            error: error.message
        })
    }
})

router.put("/", (req, res) => {
    try{
        const index = parseInt(req.params.index);
        const { content } = req.body;
        if (!content || content.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Nội dung không được để trống"
            });
        }
        const contentPath = path.join(__dirname, "../data/post.txt");
        const contents = fs
            .readFileSync(contentPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");

        if (index < 0 || index >= contents.length) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nội dung"
            });
        }
        contents[index] = content.trim();
        fs.writeFileSync(contentPath, contents.join("\n"));

        res.json({
            success: true,
            message: "Cập nhật thành công",
            data: contents
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: "Lỗi cập nhật nội dung",
            error: error.message
        });
    }
})

router.delete("/:index", (req, res) => {
    try {
        const index = parseInt(req.params.index);

        const contentPath = path.join(__dirname, "../data/post.txt");

        const contents = fs
            .readFileSync(contentPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");

        if (index < 0 || index >= contents.length) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nội dung"
            });
        }

        const deletedContent = contents[index];

        contents.splice(index, 1);

        fs.writeFileSync(contentPath, contents.join("\n"));

        res.json({
            success: true,
            message: "Xóa nội dung thành công",
            deleted: deletedContent,
            data: contents
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