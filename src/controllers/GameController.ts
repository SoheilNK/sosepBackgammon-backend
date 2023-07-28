// Define an interface for the OnlineGame object
interface OnlineGame {
    matchId: string;
    hostId: number;
    guestId: number;
    matchState: string;
}

export class GameController<T extends OnlineGame> {
    // Define an array of onlineGame objects
    private onlineGames: T[] = [];

    // Add a method to add a new online game
    addOnlineGame(game: T) {
        this.onlineGames.push(game);
    }

    // Add a method to get all online games
    getOnlineGames(): T[] {
        return this.onlineGames;
    }
}

// Define a specific type of game that implements the OnlineGame interface
class BackgammonGame implements OnlineGame {
    constructor(public matchId: string, public hostId: number, public guestId: number, public matchState: string) { }
}

// Create a new GameController instance
export const backgammonController = new GameController<BackgammonGame>();

// Add a new online chess game
const chessGame1 = new BackgammonGame("chess-123", 1, 2, "ongoing");
backgammonController.addOnlineGame(chessGame1);

// Get all online games
const allOnlineBackgammonGames = backgammonController.getOnlineGames();
console.log("online games: ", allOnlineBackgammonGames);
