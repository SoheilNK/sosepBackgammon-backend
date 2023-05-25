import { checkJwt } from "./middlewares/checkJwt";
import { checkRole } from "./middlewares/checkRole";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController";




export const Routes = [{
    //Get all users
    method: "get",
    route: "/api/users",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "all",
}, {
    // Get one user
    method: "get",
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "one",
}, {
    //Create a new user
    method: "post",
    route: "/api/users/",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "save",
}, {
    //Edit one user
    method: "put", // or patch
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "edit",
}, {
    //Delete one user
    method: "delete",
    route: "/api/users/:id([0-9]+)",
    middlewares: [checkJwt, checkRole(["ADMIN"])],
    controller: UserController,
    action: "remove",
}, {
    //Login route
    method: "post",
    route: "/api/login",
    controller: AuthController,
    action: "login",
    
    }, {
    //Change my password
    method: "post",
    route: "/api/change-password",
    middlewares: [checkJwt],
    controller: AuthController,
    action: "changePassword",
}]
