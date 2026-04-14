const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function runBot() {
    try {
        console.log("Bot bắt đầu chạy...");

        const settingsPath = path.join(__dirname, "../data/settings.json");
        const groupsPath = path.join(__dirname, "../data/groups.txt");
        const postPath = path.join(__dirname, "../data/post.txt");
        const cookiesPath = path.join(__dirname, "../data/cookies.json");
        const imageFolder = path.join(__dirname, "../data/images");

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
            defaultViewport: null,
            args: [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox"
            ]
        });

        const page = await browser.newPage();

        await page.goto("https://www.facebook.com", {
            waitUntil: "domcontentloaded"
        });

        await page.setCookie(...cookies);

        await page.reload({
            waitUntil: "domcontentloaded"
        });

        console.log("Đăng nhập Facebook thành công");

        for (const group of groups) {
            try {
                console.log("Đang mở group:", group);

                await page.goto(group, {
                    waitUntil: "domcontentloaded",
                    timeout: 60000
                });

                await new Promise(resolve =>
                    setTimeout(resolve, 5000)
                );

                const randomPost =
                    posts[Math.floor(Math.random() * posts.length)];

                console.log("Nội dung được chọn:", randomPost);

                const openButtons = await page.$$('div[role="button"]');

                let foundCreatePostButton = false;

                for (const btn of openButtons) {
                    const text = await page.evaluate(el => el.innerText, btn);

                    if (
                        text &&
                        (
                            text.includes("Write something") ||
                            text.includes("Create post") ||
                            text.includes("Bạn viết gì đi") ||
                            text.includes("Hãy viết gì đó") ||
                            text.includes("Tạo bài đăng")
                        )
                    ) {
                        console.log("Đã tìm thấy nút tạo bài:", text);

                        await btn.click();

                        foundCreatePostButton = true;
                        break;
                    }
                }

                if (!foundCreatePostButton) {
                    throw new Error("Không tìm thấy nút tạo bài viết");
                }

                console.log("Đã mở popup tạo bài viết");

                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

                const textboxSelector = 'div[role="dialog"] div[role="textbox"]';

                await page.waitForSelector(textboxSelector, {
                    timeout: 15000
                });

                await page.click(textboxSelector);

                await page.keyboard.type(randomPost, {
                    delay: 50
                });

                console.log("Đã nhập nội dung");

                const addToPostButtons = await page.$$('div[role="dialog"] div[role="button"]');

                if (addToPostButtons.length > 0) {
                    console.log("Tổng số button tìm thấy:", addToPostButtons.length);

                    await addToPostButtons[0].click();

                    console.log("Đã mở popup Add to your post");

                    await new Promise(resolve =>
                        setTimeout(resolve, 2000)
                    );
                } else {
                    console.log("Không tìm thấy button nào trong popup");
                }

                const popupButtons = await page.$$('div[role="dialog"] div[role="button"]');

                let foundPhotoVideo = false;

                for (const btn of popupButtons) {
                    const text = await page.evaluate(el => el.innerText || "", btn);

                    console.log("Popup button:", text);

                    if (
                        text.includes("Photo/video") ||
                        text.includes("Ảnh/video")
                    ) {
                        await btn.click();

                        foundPhotoVideo = true;

                        console.log("Đã click Photo/video");

                        break;
                    }
                }

                if (!foundPhotoVideo) {
                    console.log("Không tìm thấy nút Photo/video");
                }

                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

                const imageFiles = fs.readdirSync(imageFolder);

                if (imageFiles.length > 0) {
                    const randomImage =
                        imageFiles[Math.floor(Math.random() * imageFiles.length)];

                    const imagePath = path.join(imageFolder, randomImage);

                    console.log("Ảnh được chọn:", imagePath);

                    const fileInputs = await page.$$('input[type="file"]');

                    console.log("Số input file:", fileInputs.length);

                    if (fileInputs.length > 0) {
                        await fileInputs[0].uploadFile(imagePath);

                        console.log("Đã upload ảnh:", imagePath);

                        console.log("Đang chờ ảnh upload xong...");

                        await new Promise(resolve =>
                            setTimeout(resolve, 15000)
                        );
                    } else {
                        console.log("Không tìm thấy input file");
                    }
                } else {
                    console.log("Không có ảnh trong thư mục images");
                }

                await page.screenshot({
                    path: `debug-${Date.now()}.png`,
                    fullPage: true
                });

                const postButtons = await page.$$('div[role="button"]');

                let foundPostButton = false;

                for (const btn of postButtons) {
                    const text = await page.evaluate(el => el.innerText, btn);

                    if (
                        text &&
                        (
                            text.trim() === "Post" ||
                            text.trim() === "Đăng"
                        )
                    ) {
                        console.log("Đã tìm thấy nút đăng:", text);

                        await btn.click();

                        foundPostButton = true;
                        break;
                    }
                }

                if (!foundPostButton) {
                    throw new Error("Không tìm thấy nút đăng");
                }

                console.log("Đã bấm nút đăng");

                await new Promise(resolve =>
                    setTimeout(resolve, 10000)
                );

                await page.reload({
                    waitUntil: "domcontentloaded"
                });

                await page.goto("https://www.facebook.com", {
                    waitUntil: "domcontentloaded"
                });

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