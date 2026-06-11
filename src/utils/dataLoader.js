const fs = require("fs");
const path = require("path");

const Group = require("../models/Group");
const Content = require("../models/Content");
const Cookie = require("../models/Cookie");
const Setting = require("../models/Setting");

function getDataDir() {
    return path.join(__dirname, "..", "data");
}

function readTextLines(fileName) {
    const filePath = path.join(getDataDir(), fileName);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    return fs
        .readFileSync(filePath, "utf8")
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function readJsonFile(fileName, fallback = {}) {
    const filePath = path.join(getDataDir(), fileName);

    if (!fs.existsSync(filePath)) {
        return fallback;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        return fallback;
    }
}

async function loadBotData() {
    const settings = readJsonFile("settings.json", {});
    const groups = readTextLines("groups.txt");
    const posts = readTextLines("post.txt");

    let cookies = [];
    const cookiesPath = path.join(getDataDir(), "cookies.json");

    if (fs.existsSync(cookiesPath)) {
        try {
            const parsedCookies = JSON.parse(fs.readFileSync(cookiesPath, "utf8"));
            cookies = Array.isArray(parsedCookies) ? parsedCookies : [];
        } catch (error) {
            cookies = [];
        }
    }

    const imageFolder = path.join(getDataDir(), "images");
    const images = fs.existsSync(imageFolder)
        ? fs.readdirSync(imageFolder).filter(file => {
            const fullPath = path.join(imageFolder, file);
            return fs.statSync(fullPath).isFile();
        })
        : [];

    const hasFileData =
        groups.length > 0 ||
        posts.length > 0 ||
        cookies.length > 0 ||
        images.length > 0 ||
        Object.keys(settings || {}).length > 0;

    if (!hasFileData) {
        const [dbSettings, dbGroups, dbPosts, dbCookies] = await Promise.all([
            Setting.findOne().lean(),
            Group.find().lean(),
            Content.find().lean(),
            Cookie.find().lean()
        ]);

        return {
            settings: dbSettings || {},
            groups: (dbGroups || []).map(item => item.url).filter(Boolean),
            posts: (dbPosts || []).map(item => item.text).filter(Boolean),
            cookies: dbCookies || [],
            imageFolder,
            images
        };
    }

    if (
        groups.length === 0 ||
        posts.length === 0 ||
        cookies.length === 0 ||
        Object.keys(settings || {}).length === 0
    ) {
        const [dbSettings, dbGroups, dbPosts, dbCookies] = await Promise.all([
            Setting.findOne().lean(),
            Group.find().lean(),
            Content.find().lean(),
            Cookie.find().lean()
        ]);

        return {
            settings: Object.keys(settings || {}).length > 0 ? settings : (dbSettings || {}),
            groups: groups.length > 0 ? groups : (dbGroups || []).map(item => item.url).filter(Boolean),
            posts: posts.length > 0 ? posts : (dbPosts || []).map(item => item.text).filter(Boolean),
            cookies: cookies.length > 0 ? cookies : (dbCookies || []),
            imageFolder,
            images
        };
    }

    return {
        settings,
        groups,
        posts,
        cookies,
        imageFolder,
        images
    };
}

module.exports = {
    getDataDir,
    loadBotData
};
