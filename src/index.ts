import * as express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import * as cors from "cors";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { Routes } from "./routes";
import { createWebSocketServer } from "./WebSocketServer";

AppDataSource.initialize()
  .then(async () => {
    const dotenv = require("dotenv");
    dotenv.config();

    // Set the desired port for the chat WebSocket server
    const chatWebSocketPort = process.env.CHAT_WEBSOCKET_PORT || 8001;
    createWebSocketServer(chatWebSocketPort);
    // create express app

    const app = express();
    const port = process.env.PORT;

    // Call midlewares
    app.use(helmet());
    app.use(cors());
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      const middlewares = route.middlewares || []; // Assign an empty array if middlewares are not provided
      (app as any)[route.method](
        route.route,
        ...middlewares,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // setup express app here
    // ...

    // start express server
    app.listen(port);

    console.log(`Express server has started on port ${port}.`);
  })
  .catch((error) => console.log(error));
