const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    numberOfTabs: Number,
    delayMin: Number,
    delayMax: Number,
    enableImage: Boolean,
    enableRandomContent: Boolean,
    enableRandomImage: Boolean,
    headless: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model("Setting", settingSchema);