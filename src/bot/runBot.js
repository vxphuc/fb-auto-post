const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const Group = require("../models/Group");
const Content = require("../models/Content");
const Cookie = require("../models/Cookie");
const Setting = require("../models/Setting");
const Image = require("../models/Image");

function normalizeText(value) {
    return (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function clickButtonByText(buttons, expectedTexts, options = {}) {
    const { exact = false } = options;

    for (const btn of buttons) {
        const text = await btn.evaluate(el => (el.innerText || "").trim());
        const normalizedText = normalizeText(text);

        if (!normalizedText) continue;

        const matched = expectedTexts.some(expected => {
            if (exact) {
                return normalizedText === expected;
            }

            return normalizedText.includes(expected);
        });

        if (matched) {
            await btn.click();
            return true;
        }
    }

    return false;
}

async function worker(browser, workerId, workerGroups, posts, cookies, settings, imageFolder) {
    const page = await browser.newPage();

    await page.setViewport({
        width: 1280,
        height: 800
    });

    await page.goto("https://www.facebook.com", {
        waitUntil: "domcontentloaded"
    });

    await page.setCookie(...cookies);

    await page.reload({
        waitUntil: "domcontentloaded"
    });

    console.log(`[TAB ${workerId}] Đăng nhập Facebook thành công`);

    for (const group of workerGroups) {
        try {
            console.log(`[TAB ${workerId}] Đang mở group: ${group}`);

            await page.goto(group, {
                waitUntil: "domcontentloaded",
                timeout: 60000
            });

            await new Promise(resolve => setTimeout(resolve, 5000));

            const randomPost =
                posts[Math.floor(Math.random() * posts.length)];

            console.log(`[TAB ${workerId}] Nội dung được chọn: ${randomPost}`);

            const openButtons = await page.$$('div[role="button"]');

            let foundCreatePostButton = false;

            for (const btn of openButtons) {
                const text = await page.evaluate(el => el.innerText, btn);
                const normalizedText = normalizeText(text);

                if (
                    normalizedText &&
                    (
                        normalizedText.includes("write something") ||
                        normalizedText.includes("create post") ||
                        normalizedText.includes("ban viet gi di") ||
                        normalizedText.includes("hay viet gi do") ||
                        normalizedText.includes("tao bai dang")
                    )
                ) {
                    await btn.click();
                    foundCreatePostButton = true;
                    break;
                }
            }

            if (!foundCreatePostButton) {
                throw new Error("Không tìm thấy nút tạo bài viết");
            }

            await new Promise(resolve => setTimeout(resolve, 3000));

            const textboxSelector = 'div[role="dialog"] div[role="textbox"]';

            await page.waitForSelector(textboxSelector, {
                timeout: 15000
            });

            await page.click(textboxSelector);

            await page.keyboard.type(randomPost, {
                delay: 50
            });

            console.log(`[TAB ${workerId}] Đã nhập nội dung`);

            await new Promise(resolve => setTimeout(resolve, 1500));

            const imageFiles = fs.readdirSync(imageFolder);

            if (imageFiles.length > 0) {
                const dialogButtons = await page.$$('div[role="dialog"] div[role="button"]');

                const openedAddToPost = await clickButtonByText(
                    dialogButtons,
                    ["add to your post"]
                );

                if (openedAddToPost) {
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const [fileChooser] = await Promise.all([
                        page.waitForFileChooser({ timeout: 10000 }),
                        page.evaluate(() => {
                            const buttons = Array.from(
                                document.querySelectorAll('div[role="dialog"] div[role="button"]')
                            );

                            const target = buttons.find(btn => {
                                const text = (btn.innerText || "").trim().toLowerCase();
                                return text === "photo/video";
                            });

                            if (target) {
                                target.click();
                            }
                        })
                    ]);

                    const randomImage =
                        imagesData[Math.floor(Math.random() * imagesData.length)];

                    const imagePath = path.join(imageFolder, randomImage);

                    await fileChooser.accept([imagePath]);

                    console.log(`[TAB ${workerId}] Upload ảnh: ${randomImage}`);

                    await new Promise(resolve => setTimeout(resolve, 8000));
                }
            }

            const postButtons = await page.$$('div[role="dialog"] div[role="button"]');

            const posted = await clickButtonByText(
                postButtons,
                ["post", "dang"],
                { exact: true }
            );

            if (!posted) {
                throw new Error("Không tìm thấy nút đăng");
            }

            console.log(`[TAB ${workerId}] Đăng bài thành công`);

            const delayTime = randomDelay(
                settings.delayMin,
                settings.delayMax
            );

            console.log(`[TAB ${workerId}] Nghỉ ${delayTime / 1000}s`);

            await new Promise(resolve =>
                setTimeout(resolve, delayTime)
            );

        } catch (error) {
            console.log(`[TAB ${workerId}] Lỗi group: ${group}`);
            console.log(error.message);
        }
    }

    await page.close();
}

async function runBot() {
    try {
        const imagesData = await Image.find().lean();

        const settings = await Setting.findOne().lean();

        const groupsData = await Group.find().lean();
        const groups = groupsData.map(item => item.url);

        const postsData = await Content.find().lean();
        const posts = postsData.map(item => item.text);

        const cookies = await Cookie.find().lean();

        const browser = await puppeteer.launch({
            headless: settings.headless,
            defaultViewport: null,
            args: [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox"
            ]
        });

        const actualTabs = Math.min(
            settings.numberOfTabs || 4,
            groups.length
        );

        const chunkSize = Math.ceil(groups.length / actualTabs);

        const groupChunks = [];

        for (let i = 0; i < groups.length; i += chunkSize) {
            groupChunks.push(groups.slice(i, i + chunkSize));
        }

        const tasks = groupChunks.map((chunk, index) => {
            return worker(
                browser,
                index + 1,
                chunk,
                posts,
                cookies,
                settings,
                imageFolder
            );
        });

        await Promise.all(tasks);

        await browser.close();

        console.log("Đã đăng xong tất cả group");
    } catch (error) {
        console.log("Lỗi bot:", error.message);
    }
}

module.exports = runBot;