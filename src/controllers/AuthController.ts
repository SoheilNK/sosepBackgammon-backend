
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";
import { AppDataSource } from "../data-source";

export class AuthController {

    private userRepository = AppDataSource.getRepository(User);

    async login(request: Request, response: Response, next: NextFunction) {
        //Check if username and password are set
        let { username, password } = request.body;
        if (!(username && password)) {
            response.status(400).send('No username or password received');
        }

        //Get user from database
        let user: User;
        try {
            user = await this.userRepository.findOneOrFail({ where: { username } });
        } catch (error) {
            response.status(401).send();
        }

        //Check if encrypted password matches
        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            response.status(401).send("username or password is incorrect");
            return;
        }

        //Sign JWT, valid for 1 hour
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            config.jwtSecret,
            { expiresIn: "1h" }
        );

        //Send the JWT in the response
        response.send(token);
    }

    async changePassword(request: Request, response: Response, next: NextFunction) {
        //Get ID from JWT
        const id = response.locals.jwtPayload.userId;

        //Get parameters from the body
        const { oldPassword, newPassword } = request.body;
        if (!(oldPassword && newPassword)) {
            response.status(400).send();
        }

        //Get user from the database
        let user: User;
        try {
            user = await this.userRepository.findOneOrFail(id);
        } catch (error) {
            response.status(401).send();
        }

        //Check if the old password matches
        if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
            response.status(401).send();
            return;
        }

        //Validate the model (password length)
        user.password = newPassword;
        const errors = await validate(user);
        if (errors.length > 0) {
            response.status(400).send(errors);
            return;
        }

        //Hash the new password and save
        user.hashPassword();
        await this.userRepository.save(user);

        response.status(204).send();
    }
}
