import { AppDataSource } from "../data-source"
import { User } from "../entity/User"
import { NextFunction, Request, Response } from "express"

// Define an interface for the OnlineGame object
interface OnlineGame {
    matchId: string;
    hostName: string;
    guestName: string;
    status: string;
}

// Define an array to store all online games
const onlineGames: OnlineGame[] = [];
export class GameController {
    private userRepository = AppDataSource.getRepository(User)

    
    // Add a method to add a new online game
    async addOnlineGame(request: Request, response: Response, next: NextFunction) {
        console.log("add online game")
        let result = response.locals.result
        console.log('result from addOnlineGame: ' + JSON.stringify(result))
        let username = result.userName
        console.log('result from addOnlineGame: ' + username)
        // //get user from database
        // let user: User
        // try {
        //     user = await this.userRepository.findOneOrFail({ where: { username } });
        //     response.status(200).send(user)
        // } catch (error) {
        //     // response.status(404).send({ message: "User not found in data base" });
        
        // }
        //create a unique matchId using the current timestamp and the user's id
        let matchId = Date.now().toString()  
        // Create a new onlineGame object
        const newOnlineGame: OnlineGame = {
            matchId: matchId,
            hostName: username,
            guestName: "",
            status: "Waiting for guest"
        };

        onlineGames.push(newOnlineGame);
        console.log(`You have successfully added online game "${newOnlineGame.matchId}" to database`)
        console.log(`All online games: ${JSON.stringify(onlineGames)}`)

        // Return the newly added online game
        return newOnlineGame;
     
    }

    // Add a method to get all online games
    async getOnlineGames(request: Request, response: Response, next: NextFunction) {
    return onlineGames;
    }
}

