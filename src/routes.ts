import { UserController, AuthController } from "./controllers/UserController"
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

export const Routes = [{
    //Get all users
    method: "get",
    route: "/api/users",
    controller: UserController,
    action: "all",
    middlewares: [checkJwt, checkRole(["ADMIN"])]
}, {
    // Get one user
    method: "get",
    route: "/api/users/:id([0-9]+)",
    controller: UserController,
    action: "one",
    middlewares: [checkJwt, checkRole(["ADMIN"])]
}, {
    //Create a new user
    method: "post",
    route: "/api/users/",
    controller: UserController,
    action: "save",
    middlewares: [checkJwt, checkRole(["ADMIN"])]
}, {
    //Edit one user
    method: "put", // or patch
    route: "/api/users/:id([0-9]+)",
    controller: UserController,
    action: "edit",
    middlewares: [checkJwt, checkRole(["ADMIN"])]
}, {
    //Delete one user
    method: "delete",
    route: "/api/users/:id([0-9]+)",
    controller: UserController,
    action: "remove",
    middlewares: [checkJwt, checkRole(["ADMIN"])]
}, {
    //Login route
    method: "post",
    route: "/api/login",
    controller: AuthController,
    action: "login"
}, {
    //Change my password
    method: "post",
    route: "/api/change-password",
    controller: AuthController,
    action: "changePassword",
    middlewares: [checkJwt]
}]
