const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { resolve } = require("dns");

async function runBot() {
    try {
        console.log("Bot bắt đầu chạy...");

        const settingsPath = path.join(__dirname, "../data/settings.json");
        const groupsPath = path.join(__dirname, "../data/groups.txt");
        const postPath = path.join(__dirname, "../data/post.txt");
        const cookiesPath = path.join(__dirname, "../data/cookies.json");

        const settings = JSON.parse(
            fs.readFileSync(settingsPath, "utf8")
        );

        const groups = fs
            .readFileSync(groupsPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");

        const posts = fs
            .readFileSync(postPath, "utf8")
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");

        const cookies = JSON.parse(
            fs.readFileSync(cookiesPath, "utf8")
        );

        const browser = await puppeteer.launch({
            headless: settings.headless,
            defaultViewport: null
        });

        const page = await browser.newPage();

        await page.goto("https://facebook.com", {
            waitUntil: "networkidle2"
        });

        await page.setCookie(...cookies);

        console.log("Đăng nhập Facebook thành công");

        for (const group of groups) {
            try {
                console.log("Đang mở group:", group);

                await page.goto(group, {
                    waitUntil: "networkidle2"
                });
                await new Promise(resolve =>
                    setTimeout(resolve, 5000)
                );
                const randomPost =
                    posts[Math.floor(Math.random() * posts.length)];

                console.log("Nội dung được chọn:", randomPost);

                const createPostSelector = 'div[role="button"][aria-label*="What\'s on your mind"], div[role="button"][aria-label*="Bạn viết gì đi"], div[role="button"][aria-label*="Write something"]';
                await page.waitForSelector(createPostSelector, {
                    timeout: 10000
                });
                await page.click(createPostSelector);
                console.log("Đã mở popup tạo bài viết");
                await new Promise(resolve => 
                    setTimeout(resolve, 2000)
                )
                const textboxSelector = 'div[role="dialog"] div[role="textbox"]';
                await page.waitForSelector(textboxSelector, {
                    timeout: 15000
                });
                await page.click(textboxSelector);
                await page.keyboard.type(randomPost, {
                    delay: 50
                });
                console.log("Đã nhập nội dung");
                const postButtonSelector = 'div[role="dialog"] div[aria-label="Post"], div[role="dialog"] div[aria-label="Đăng"]';

                await page.waitForSelector(postButtonSelector, {
                    timeout: 15000
                });

                await page.click(postButtonSelector);

                console.log("Đã bấm nút đăng");
                
                await new Promise(resolve =>
                    setTimeout(resolve, settings.delayMin)
                );

            } catch (groupError) {
                console.log("Lỗi group:", group);
                console.log(groupError.message);
            }
        }

        await browser.close();

        console.log("Bot chạy xong");
    } catch (error) {
        console.log("Lỗi bot:", error.message);
    }
}

module.exports = runBot;