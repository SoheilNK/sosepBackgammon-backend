import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket";
import * as types from "./types";
import { onlineGames } from "./controllers/GameController";

const getUniqueID = () => {
  var s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

const onlineUsers : types.OnlineUser[] = [];

export class WebSocketServer {
  static clients: Map<string, W3CWebSocket>;
  private webSocketServer: any; // Type it properly to avoid any

  constructor(port: number) {
    WebSocketServer.clients = new Map<string, W3CWebSocket>();
    const webSocketServer = require("websocket").server;
    const http = require("http");

    const server = http.createServer();
    server.listen(port);
    console.log(`WebSocketServer listening on port ${port}`);

    this.webSocketServer = new webSocketServer({
      httpServer: server,
    });

    this.webSocketServer.on("request", (request: any) => {
      let userID: string;
      const { origin } = request;
      console.log(`Received a new connection from origin ${origin}.`);

      const connection = request.accept(null, request.origin);

      if (request.key && WebSocketServer.clients.has(request.key)) {
        userID = request.key;
        console.log(`User ${userID} reconnected.`);
      } else {
        userID = getUniqueID();
        WebSocketServer.clients.set(userID, connection);
        console.log(`New user ${userID} connected.`);
        //send back userID to the client
        let msg: types.WsData = {
          type: "userID",
          msg: userID,
          user: "",
          matchId: "",
          msgFor: "all",
        };
        connection.sendUTF(JSON.stringify(msg));

        //update onlinemages
      }

      console.log(
        "WebSocket-connected for user id: " +
          userID +
          " in " +
          Array.from(WebSocketServer.clients.keys()) + " and userID sent to client "
      );
      let onlineUser: types.OnlineUser = {
        userId: userID,
        userName: "",
        status: "Online",
      };
      onlineUsers.push(onlineUser);
      console.log(`onlineUsers: ${JSON.stringify(onlineUsers)}`);

      let thisGame: types.OnlineGame;
      connection.on("message", (message) => {
        if (message.type === "utf8") {
          try {
            console.log("Received Message: ", message.utf8Data);
            let data: types.WsData = JSON.parse(message.utf8Data);
            let msgFor = data.msgFor;
            if (msgFor === "all") {
              //send the message to all users
              WebSocketServer.clients.forEach((connection, key) => {
                connection.send(message.utf8Data);
                console.log(`Sent Message to ${key}`);
              });
            } else {
              
              //get the opponent's id from the onlineGames array
              thisGame = onlineGames.find(
                (game: any) => game.matchId === data.matchId
              );
              console.log(`thisGame: ${JSON.stringify(thisGame)}`);
              let opponentId =
                msgFor === "host" ? thisGame.hostId : thisGame.guestId;
              //send the message to the opponent
              const client = WebSocketServer.clients.get(opponentId);
              if (client) {
                client.send(message.utf8Data);
                console.log(`Sent Message to ${opponentId}`);
              }
            }

            //for chat messages send the message to the sender too
            if (data.type === "chat") {
              connection.sendUTF(message.utf8Data);
              console.log(`Sent Message to ${userID}`);
            }

            // //send the message to the sender
            // connection.sendUTF(message.utf8Data);
            // console.log(`Sent Message to ${userID}`);

            // //send the message to all other users
            // WebSocketServer.clients.forEach((otherConnection, key) => {
            //     if (key !== userID) {
            //         otherConnection.sendUTF(message.utf8Data);
            //         console.log(`Sent Message to ${key}`);
            //     }
            // });
          } catch (error) {
            console.log(error);
          }
        }
      });

      connection.on("close", () => {
        WebSocketServer.clients.delete(userID);
        console.log(`User ${userID} disconnected.`);
        //if the host left remove the matchid from the onlineGames array
        if (thisGame && thisGame.hostId === userID) {
          onlineGames.splice(onlineGames.indexOf(thisGame), 1);
          console.log(`Removed ${thisGame.matchId} from onlineGames array`);
        }
        //update onlineUsers
        let index = onlineUsers.findIndex(
          (onlineUser) => onlineUser.userId === userID
        );
        onlineUsers.splice(index, 1);
        console.log(`onlineUsers: ${JSON.stringify(onlineUsers)}`);
        
      });
    });
  }

  public sendMessage(clientId: string, message: string) {
    const client = WebSocketServer.clients.get(clientId);
    if (client) {
      client.send(message);
    }
  }
}
