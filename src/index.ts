import * as express from "express"
import * as bodyParser from "body-parser"
import helmet from 'helmet';
import * as cors from "cors";
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"




AppDataSource.initialize().then(async () => {

    //create a webSocket server----------------START-------------------------
    const webSocketServerPort = process.env.WEBSOCKET_PORT;
    const webSocketServer = require('websocket').server;
    const http = require('http');

    // Spinning the http server and the websocket server.
    const server = http.createServer();
    server.listen(webSocketServerPort);
    console.log(`webSocketServer listening on port ${webSocketServerPort}`);

    const wsServer = new webSocketServer({
        httpServer: server
    });

    const clients = {};

    // This code generates unique userid for everyuser.
    const getUniqueID = () => {
        var s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return s4() + s4() + '-' + s4();
    };

    wsServer.on("request", (request) => {
        var userID = getUniqueID();
        let key: string;
        console.log((new Date()) + 'Received a new connection from origin' + request.origin + '.');
        // You can rewrite this part of the code to accept only the requests from allowed origin
        const connection = request.accept(null, request.origin);
        clients[userID] = connection;
        console.log('WS-connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                console.log('Received Message: ', message.utf8Data);

                // broadcasting message to all connected clients
                for (key in clients) {
                    clients[key].sendUTF(message.utf8Data);
                    console.log('sent Message to: ', clients[key]);
                }
            }
        })
    });
    //create a webSocket server----------------END-------------------------

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

    console.log(`Express server has started on port ${port}.`)

}).catch(error => console.log(error))
