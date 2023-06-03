import * as express from "express"
import * as bodyParser from "body-parser"
import helmet from 'helmet';
import * as cors from "cors";
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"

import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);


AppDataSource.initialize().then(async () => {

    // create express app
    const dotenv = require('dotenv');
    dotenv.config();

    const app = express()
    const port = process.env.PORT;

    // Call midlewares
    app.use(helmet());
    app.use(cors());
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach(route => {
        const middlewares = route.middlewares || []; // Assign an empty array if middlewares are not provided
        (app as any)[route.method](route.route, ...middlewares, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })

    // setup express app here
    // ...

    // start express server
    app.listen(port)

    console.log(`Express server has started on port ${port}. Open http://localhost:${port}/api/users to see results`)

}).catch(error => console.log(error))
