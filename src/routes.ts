import { checkRole } from "./middlewares/checkRole";
import { UserController } from "./controllers/UserController";
import { GameController } from "./controllers/GameController";
import { checkJwtCognito } from "./middlewares/checkJwtCognito";




export const Routes = [
  {
    //Get all users--
    method: "get",
    route: "/api/user",
    middlewares: [checkJwtCognito],
    controller: UserController,
    action: "getUser",
  },
  {
    //Get all online games
    method: "get",
    route: "/api/games",
    controller: GameController,
    middlewares: [checkJwtCognito],
    action: "getOnlineGames",
  },
  {
    //Add a new online game
    method: "post",
    route: "/api/games/add",
    controller: GameController,
    middlewares: [checkJwtCognito],
    action: "addOnlineGame",
  },
  {
    //Join an online game
    method: "post",
    route: "/api/games/join",
    controller: GameController,
    middlewares: [checkJwtCognito],
    action: "joinOnlineGame",
  },
  {
    //Update an online game
    method: "post",
    route: "/api/games/update",
    controller: GameController,
    middlewares: [checkJwtCognito],
    action: "updateOnlineGame",
  },
];

