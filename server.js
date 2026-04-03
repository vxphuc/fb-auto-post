const app = require("./src/app");

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server đang chạy tại http://localhost:${PORT}`);
})