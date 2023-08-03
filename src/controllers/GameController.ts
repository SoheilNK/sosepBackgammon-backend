import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { NextFunction, Request, Response } from "express";

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
    let matchId = Date.now().toString();

    // Create a new onlineGame object
    const newOnlineGame: OnlineGame = {
      matchId: matchId,
      hostName: username,
      guestName: "",
      hostId: "",
      guestId: "",
      status: "Waiting for guest",
    };

    onlineGames.push(newOnlineGame);
    console.log(
      `You have successfully added online game "${newOnlineGame.matchId}" to database`
    );
    // console.log(`All online games: ${JSON.stringify(onlineGames)}`)

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
    console.log("result from joinOnlineGame: " + username);
    let matchId = request.body.matchId;
    console.log("matchId from joinOnlineGame: " + matchId);
    let guestName = username;
    let status = "Playing";

    // Find the online game with the specified matchId
    const onlineGame = onlineGames.find(
      (onlineGame) => onlineGame.matchId === matchId
    );
    if (!onlineGame) {
      throw new Error(`Cannot find online game with matchId: ${matchId}`);
    }

    // Update the online game
    onlineGame.guestName = guestName;
    onlineGame.status = status;

    //Update onlineGames array
    const index = onlineGames.findIndex(
      (onlineGame) => onlineGame.matchId === matchId
    );
    onlineGames[index] = onlineGame;

    //send onlineGame via wsServer to host

    // Return the updated online game
    return onlineGame;
  }

    // Add a method to update an online game
    async updateOnlineGame(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        console.log("update online game");
        //read onlineGame from request body
        let newOnlineGame = request.body.onlineGame;

        // // Find the online game with the specified matchId
        // const onlineGame = onlineGames.find(
        //     (onlineGame) => onlineGame.matchId === newOnlineGame.matchId
        // );
        // if (!onlineGame) {
        //     throw new Error(`Cannot find online game with matchId: ${matchId}`);
        // }

        // // Update the online game
        // onlineGame.status = status;

        //Update onlineGames array
        const index = onlineGames.findIndex(
          (onlineGame) => onlineGame.matchId === newOnlineGame.matchId
        );
        onlineGames[index] = newOnlineGame;

        //send onlineGame via wsServer to host

        // Return the updated online game
        return onlineGame;
    }
}
