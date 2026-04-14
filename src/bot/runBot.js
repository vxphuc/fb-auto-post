const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

function normalizeText(value) {
    return (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

async function clickButtonByText(buttons, expectedTexts, logPrefix, options = {}) {
    const { exact = false } = options;

    for (const btn of buttons) {
        const text = await btn.evaluate(el => (el.innerText || "").trim());
        const normalizedText = normalizeText(text);

        console.log(`${logPrefix}:`, text);

        if (!normalizedText) {
            continue;
        }

        const matched = expectedTexts.some(expected => {
            if (exact) {
                return normalizedText === expected;
            }

            return normalizedText.includes(expected);
        });

        if (matched) {
            await btn.click();
            return { clicked: true, text, normalizedText };
        }
    }

    return { clicked: false, text: "", normalizedText: "" };
}

async function runBot() {
    try {
        console.log("Bot bat dau chay...");

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

        page.on("dialog", async dialog => {
            try {
                const message = normalizeText(dialog.message());

                if (dialog.type() === "beforeunload" || message.includes("leave site")) {
                    console.log("Phat hien hop thoai roi trang, chap nhan de tiep tuc");
                    await dialog.accept();
                    return;
                }

                await dialog.dismiss();
            } catch (dialogError) {
                console.log("Khong xu ly duoc dialog:", dialogError.message);
            }
        });

        await page.goto("https://www.facebook.com", {
            waitUntil: "domcontentloaded"
        });

        await page.setCookie(...cookies);

        await page.reload({
            waitUntil: "domcontentloaded"
        });

        console.log("Dang nhap Facebook thanh cong");

        for (const group of groups) {
            try {
                console.log("Dang mo group:", group);

                await page.goto(group, {
                    waitUntil: "domcontentloaded",
                    timeout: 60000
                });

                await new Promise(resolve =>
                    setTimeout(resolve, 5000)
                );

                const randomPost =
                    posts[Math.floor(Math.random() * posts.length)];

                console.log("Noi dung duoc chon:", randomPost);

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
                        console.log("Da tim thay nut tao bai:", text);

                        await btn.click();

                        foundCreatePostButton = true;
                        break;
                    }
                }

                if (!foundCreatePostButton) {
                    throw new Error("Khong tim thay nut tao bai viet");
                }

                console.log("Da mo popup tao bai viet");

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

                console.log("Da nhap noi dung");

                await new Promise(resolve =>
                    setTimeout(resolve, 1500)
                );

                const imageFiles = fs.readdirSync(imageFolder);

                if (imageFiles.length > 0) {
                    const dialogButtons = await page.$$('div[role="dialog"] div[role="button"]');
                    const addToPostResult = await clickButtonByText(
                        dialogButtons,
                        ["add to your post"],
                        "Create post button"
                    );

                    if (!addToPostResult.clicked) {
                        throw new Error("Khong tim thay nut Add to your post");
                    }

                    console.log("Da mo popup Add to your post");

                    await page.waitForFunction(() => {
                        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                        return dialogs.some(dialog =>
                            (dialog.innerText || "").toLowerCase().includes("photo/video")
                        );
                    }, { timeout: 10000 });

                    const addPostButtons = await page.$$('div[role="dialog"] div[role="button"]');
                    let foundPhotoVideo = false;

                    for (const btn of addPostButtons) {
                        const text = await btn.evaluate(el => (el.innerText || "").trim());
                        const normalizedText = normalizeText(text);

                        console.log("Add to post button:", text);

                        if (normalizedText === "photo/video") {
                            foundPhotoVideo = true;
                            break;
                        }
                    }

                    if (!foundPhotoVideo) {
                        throw new Error("Khong tim thay nut Photo/Video");
                    }

                    const randomImage =
                        imageFiles[Math.floor(Math.random() * imageFiles.length)];

                    const imagePath = path.join(imageFolder, randomImage);

                    console.log("Anh duoc chon:", imagePath);
                    const [fileChooser] = await Promise.all([
                        page.waitForFileChooser({ timeout: 10000 }),
                        page.evaluate(() => {
                            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                            const target = dialogs
                                .flatMap(dialog => Array.from(dialog.querySelectorAll('div[role="button"]')))
                                .find(button => (button.innerText || "").trim().toLowerCase() === "photo/video");

                            if (target) {
                                target.click();
                            }
                        })
                    ]);

                    await fileChooser.accept([imagePath]);

                    console.log("Da upload anh:", imagePath);
                    console.log("Dang cho anh upload xong...");

                    await page.waitForFunction(() => {
                        const dialog = document.querySelector('div[role="dialog"]');
                        if (!dialog) {
                            return false;
                        }

                        const text = (dialog.innerText || "").toLowerCase();
                        return !text.includes("add to your post");
                    }, { timeout: 5000 }).catch(() => null);

                    await new Promise(resolve =>
                        setTimeout(resolve, 8000)
                    );
                } else {
                    console.log("Khong co anh trong thu muc images");
                }

                // await page.screenshot({
                //     path: `debug-${Date.now()}.png`,
                //     fullPage: true
                // });

                const postButtons = await page.$$('div[role="dialog"] div[role="button"]');
                const postResult = await clickButtonByText(
                    postButtons,
                    ["post", "dang"],
                    "Post button",
                    { exact: true }
                );

                if (!postResult.clicked) {
                    throw new Error("Khong tim thay nut dang");
                }

                console.log("Da bam nut dang:", postResult.text);

                await new Promise(resolve =>
                    setTimeout(resolve, 6000)
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
                console.log("Loi group:", group);
                console.log(groupError.message);
            }
        }

        await browser.close();

        console.log("Bot chay xong");
    } catch (error) {
        console.log("Loi bot:", error.message);
    }
}

module.exports = runBot;
