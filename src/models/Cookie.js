const mongoose = require("mongoose");

const cookieSchema = new mongoose.Schema({
    name: String,
    value: String,
    domain: String,
    path: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Cookie", cookieSchema);