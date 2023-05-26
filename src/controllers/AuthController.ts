
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";
import { AppDataSource } from "../data-source";

export class AuthController {

    private userRepository = AppDataSource.getRepository(User);

    async login(request: Request, response: Response, next: NextFunction) {
        let { username, password } = request.body;

        if (!(username && password)) {
            response.status(400).send("No username or password received");
            return;
        }

        try {
            let user = await this.userRepository.findOneOrFail({ where: { username } });

            if (!user.checkIfUnencryptedPasswordIsValid(password)) {
                response.status(401).send("Username or password is incorrect");
                return;
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                config.jwtSecret,
                { expiresIn: "1h" }
            );

            response.send(token);
        } catch (error) {
            response.status(401).send("Unauthorized");
        }
    }


    async changePassword(request: Request, response: Response, next: NextFunction) {
        const id = response.locals.jwtPayload.userId;
        const { oldPassword, newPassword } = request.body;

        if (!(oldPassword && newPassword)) {
            response.status(400).send("Missing old or new password");
            return;
        }

        try {
            let user = await this.userRepository.findOneOrFail({where : {id}});

            if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
                response.status(401).send("Invalid old password");
                return;
            }

            user.password = newPassword;
            const errors = await validate(user);
            if (errors.length > 0) {
                response.status(400).send(errors);
                return;
            }

            user.hashPassword();
            await this.userRepository.save(user);

            response.status(204).send();
        } catch (error) {
            response.status(401).send("Unauthorized");
        }
    }

}
