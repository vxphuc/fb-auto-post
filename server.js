require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/database");

const PORT = 3000;

connectDatabase();

app.listen(PORT, () => {
    console.log(`server đang chạy tại http://localhost:${PORT}`);
})