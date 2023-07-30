import * as express from "express"
import * as bodyParser from "body-parser"
import helmet from 'helmet';
import * as cors from "cors";
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";



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


    // This code generates unique userid for everyuser.
    const getUniqueID = () => {
        var s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return s4() + s4() + '-' + s4();
    };

    const clients = new Map<string, W3CWebSocket>();

    wsServer.on("request", (request) => {
        let userID: string;
        const { origin } = request;
        console.log((new Date()) + ' Received a new connection from origin ' + origin + '.');

        const connection = request.accept(null, request.origin);
        // Check if the userID already exists in the clients Map
        if (request.key && clients.has(request.key)) {
            userID = request.key;
            console.log(`User ${userID} reconnected.`);
        } else {
            userID = getUniqueID();
            clients.set(userID, connection);
            console.log(`New user ${userID} connected.`);
        }

        console.log('WS-connected: ' + userID + ' in ' + Array.from(clients.keys()));

        connection.on('message', function (message: IMessageEvent) {
            if (message.type === 'utf8') {
                console.log('Received Message: ', message.utf8Data);

                // broadcasting message to all connected clients except the sender
                clients.forEach((otherConnection, key) => {
                    if (key !== userID) {
                        otherConnection.sendUTF(message.utf8Data);
                        console.log(`Sent Message to ${key}`);
                    }
                });
            }
        });

        // Handle the connection close event to remove the user from clients when disconnected
        connection.on('close', () => {
            clients.delete(userID);
            console.log(`User ${userID} disconnected.`);
        });
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


