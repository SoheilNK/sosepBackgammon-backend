"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mysql_1 = __importDefault(require("mysql"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const db = mysql_1.default.createConnection({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});
db.connect((error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log("MySQL connected!");
    }
});
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server is running');
});
app.listen(port, () => {
    console.log(`⚡️[server]: My server is running at http://localhost:${port}`);
});
