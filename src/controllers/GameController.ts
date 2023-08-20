import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express";
import * as interfaces from "../types";
import { webSocketServerInstance } from "../index";
import * as type from "../types";
import { error } from "console";
import { on } from "events";

// Define an interface for the OnlineGame object
export interface OnlineGame {
  matchId: string;
  hostName: string;
  guestName: string;
  hostId: string;
  guestId: string;
  status: string;
}

// Define an array to store all online games
export const onlineGames: OnlineGame[] = [];
export class GameController {
  private userRepository = AppDataSource.getRepository(User);

  // Add a method to add a new online game
  async addOnlineGame(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    console.log("add online game");
    let result = response.locals.result;
    console.log("result from addOnlineGame: " + JSON.stringify(result));
    let username = result.userName;
    console.log("result from addOnlineGame: " + username);
    //read onlineUser from request body
    let onlineUser: type.OnlineUser = JSON.parse(request.body.onlineUser);
    console.log("onlineUser from addOnlineGame: " + onlineUser);

    if (onlineUser.userName === username) {
      console.log("onlineUser.userName === username");
    } else {
      console.log("onlineUser.userName !== username");
      return error("onlineUser.userName !== username");
    }

    let matchId = Date.now().toString();

    // Create a new onlineGame object
    const newOnlineGame: OnlineGame = {
      matchId: matchId,
      hostName: username,
      hostId: onlineUser.userId,
      guestName: "",
      guestId: "",
      status: "Waiting for guest",
    };

    onlineGames.push(newOnlineGame);
    console.log(
      `You have successfully added online game "${newOnlineGame.matchId}" to database`
    );
    // console.log(`All online games: ${JSON.stringify(onlineGames)}`)
    //send onlineGame via wsServer to all clients
    let msg: type.WsData = {
      type: "newGame",
      msg: JSON.stringify(newOnlineGame),
      user: "",
      matchId: "",
      msgFor: "all",
    };
    // Return the newly added online game
    return newOnlineGame;
  }

  // Add a method to get all online games
  async getOnlineGames(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    return onlineGames;
  }

  // Join an online game
  async joinOnlineGame(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    console.log("join online game");
    let result = response.locals.result;
    console.log("result from joinOnlineGame: " + JSON.stringify(result));
    let username = result.userName;
    console.log("userName from joinOnlineGame: " + username);
    let matchId = request.body.matchId;
    console.log("matchId from joinOnlineGame: " + matchId);
    let status = "Playing";

    //read onlineUser from request body
    const onlineGeust: type.OnlineUser = JSON.parse(request.body.onlineUser);
    console.log("onlineUser from joinOnlineGame: " + onlineGeust);

    // if (onlineUser.userName === username) {
    //   console.log("onlineUser.userName === username");
    // } else {
    //   console.log("onlineUser.userName !== username");
    //   return error("onlineUser.userName !== username");
    // }

    // Find the online game with the specified matchId
    const onlineGame = onlineGames.find(
      (onlineGame) => onlineGame.matchId === matchId
    );
    if (!onlineGame) {
      throw new Error(`Cannot find online game with matchId: ${matchId}`);
    }

    // Update the online game
    onlineGame.guestName = onlineGeust.userName;
    onlineGame.guestId = onlineGeust.userId;
    onlineGame.status = status;

    //Update onlineGames array
    const index = onlineGames.findIndex(
      (onlineGame) => onlineGame.matchId === matchId
    );
    onlineGames[index] = onlineGame;
    console.log("joined Game: " + onlineGame);
   
    //send onlineGame via wsServer to host
    let hostId = onlineGame.hostId;
    let guestId = onlineGame.guestId;
    if (guestId) {
      let weMessage: type.WsData = {
        type: "gameJoined",
        msg: onlineGame as any,
        user: "",
        matchId: "",
        msgFor: "host",
      };
      webSocketServerInstance.sendMessage(hostId, JSON.stringify(weMessage));
    }
    return onlineGame;
  }

}
