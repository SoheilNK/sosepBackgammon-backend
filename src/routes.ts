import { checkJwt } from "./middlewares/checkJwt";
import { checkRole } from "./middlewares/checkRole";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";
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
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,

    action: "all",
}, {
    // Get one user--
    method: "get",
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "one",
}, {
    //Edit one user--
    method: "put", // or patch
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "edit",
}, {
    //Delete one user--
    method: "delete",
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "remove",
}, {
    //Create a new user--
    method: "post",
    route: "/api/auth/signup",
    // middlewares: [checkJwt],
    controller: AuthController,
    action: "signup",
}, {
    //Login route--
    method: "post",
    route: "/api/auth/signin",
    controller: AuthController,
    action: "signin",

}, {
    //Change my password
    method: "post",
    route: "/api/change-password/",
    middlewares: [checkJwt],
    controller: AuthController,
    action: "changePassword",
}]
