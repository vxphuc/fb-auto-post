const express = require("express");
const cors = require("cors");
const app = express();

const groupRoutes = require("./routes/groupRoutes");
const contentRoutes = require("./routes/contentRoutes");
const cookieRoutes = require("./routes/cookieRoutes");
const imageRoutes = require("./routes/imageRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use("/api/images", imageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/cookies", cookieRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Backend đang chạy"
    })
});

module.exports = app;