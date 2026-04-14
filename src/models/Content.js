const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Content", contentSchema);