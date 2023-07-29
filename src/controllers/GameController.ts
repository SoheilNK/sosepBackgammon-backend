// Define an interface for the OnlineGame object
interface OnlineGame {
    matchId: string;
    hostId: number;
    guestId: number;
    status: string;
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

