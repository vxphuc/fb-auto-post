const mongoose = require("mongoose");
const groupSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("Group", groupSchema);