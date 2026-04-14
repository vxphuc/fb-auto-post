const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    fileName: String,
    originalName: String,
    imageUrl: String,
    publicId: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Image", imageSchema);