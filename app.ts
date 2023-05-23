import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const db = mysql.createConnection({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server is running');
});

app.listen(port, () => {
    console.log(`⚡️[server]: My server is running at http://localhost:${port}`);
});