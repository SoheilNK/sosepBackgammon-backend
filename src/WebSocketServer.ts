import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";

const getUniqueID = () => {
    var s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

export const createWebSocketServer = (port: number) => {
    const webSocketServer = require('websocket').server;
    const http = require('http');

    const server = http.createServer();
    server.listen(port);
    console.log(`webSocketServer listening on port ${port}`);

    const wsServer = new webSocketServer({
        httpServer: server
    });

    const clients = new Map<string, W3CWebSocket>();

    wsServer.on("request", (request) => {
        let userID: string;
        const { origin } = request;
        console.log(` Received a new connection from origin ${origin}.`);

        const connection = request.accept(null, request.origin);

        if (request.key && clients.has(request.key)) {
            userID = request.key;
            console.log(`User ${userID} reconnected.`);
        } else {
            userID = getUniqueID();
            clients.set(userID, connection);
            console.log(`New user ${userID} connected.`);
        }

        console.log('WebSocket-connected for user id: ' + userID + ' in ' + Array.from(clients.keys()));

        connection.on('message', function (message: IMessageEvent) {
            if (message.type === 'utf8') {
                console.log('Received Message: ', message.utf8Data);

                clients.forEach((otherConnection, key) => {
                    if (key !== userID) {
                        otherConnection.sendUTF(message.utf8Data);
                        console.log(`Sent Message to ${key}`);
                    }
                });
            }
        });

        connection.on('close', () => {
            clients.delete(userID);
            console.log(`User ${userID} disconnected.`);
        });
    });
};
