import { checkRole } from "./middlewares/checkRole";
import { UserController } from "./controllers/UserController";
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
    //Get all users--
    method: "get",
    route: "/api/users",
    middlewares: [ checkRole(["ADMIN"])],
    controller: UserController,

    action: "all",
}, {
    // Get one user--
    method: "get",
    route: "/api/users/:id([0-9]+)",
    middlewares: [ checkRole(["ADMIN"])],
    controller: UserController,
    action: "one",
}, {
    //Edit one user--
    method: "put", // or patch
    route: "/api/users/:id([0-9]+)",
    middlewares: [ checkRole(["ADMIN"])],
    controller: UserController,
    action: "edit",
}, {
    //Delete one user--
    method: "delete",
    route: "/api/users/:id([0-9]+)",
    middlewares: [ checkRole(["ADMIN"])],
    controller: UserController,
    action: "remove",
    }, 
];

