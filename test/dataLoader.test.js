const test = require("node:test");
const assert = require("node:assert/strict");

const { loadBotData } = require("../src/utils/dataLoader");

test("loadBotData reads data from the data folder", async () => {
    const data = await loadBotData();

    assert.ok(data.settings, "settings should be loaded");
    assert.ok(Array.isArray(data.groups), "groups should be an array");
    assert.ok(data.groups.length > 0, "groups should not be empty");
    assert.ok(Array.isArray(data.posts), "posts should be an array");
    assert.ok(data.posts.length > 0, "posts should not be empty");
    assert.ok(Array.isArray(data.cookies), "cookies should be an array");
    assert.ok(Array.isArray(data.images), "images should be an array");
    assert.ok(data.imageFolder, "imageFolder should be present");
});
