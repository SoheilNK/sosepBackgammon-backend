
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";

import { User } from "../entity/User";
import config from "../config/config";
import { AppDataSource } from "../data-source";

export class AuthController {

    private userRepository = AppDataSource.getRepository(User);

    async signup(request: Request, response: Response, next: NextFunction) {
        const { username, password, email } = request.body;

        const user = Object.assign(new User(), {
            username: username,
            email: email,
            password: password,
            role: "USER"
        });

        try {
            const errors = await validate(user);
            if (errors.length > 0) {
                response.status(400).send(errors);
            } else {
                user.hashPassword();
                await this.userRepository.save(user);
                response.status(201).send({
                    message: "You have successfully registered\nPlease sign in to continue"
                });
            }
        } catch (error) {
            response.status(409).send({ message: "Username already in use" });
        }
    }

    async signin(request: Request, response: Response, next: NextFunction) {
        let { username, password } = request.body;

        if (!(username && password)) {
            response.status(400).send({ message: "No username or password received" });
            return;
        }

        try {
            let user = await this.userRepository.findOneOrFail({ where: { username } });
            if (!user) {
                return response.status(404).send({ message: "User Not found." });
            }
            if (!user.checkIfUnencryptedPasswordIsValid(password)) {
                response.status(401).send({ message: "Invalid Password!" });
                return;
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                config.jwtSecret,
                { expiresIn: "1h" }
            );

            response.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                accessToken: token
            });
        } catch (error) {
            response.status(401).send({ message: "Unauthorized" });
        }
    }


    async changePassword(request: Request, response: Response, next: NextFunction) {
        const id = response.locals.jwtPayload.userId;
        const { oldPassword, newPassword } = request.body;

        if (!(oldPassword && newPassword)) {
            response.status(400).send({ message: "Missing old or new password" });
            return;
        }

        try {
            let user = await this.userRepository.findOneOrFail({ where: { id } });

            if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
                response.status(401).send({ message: "Invalid old password" });
                return;
            }

            user.password = newPassword;
            const errors = await validate(user);
            if (errors.length > 0) {
                response.status(400).send(errors);
            }

            user.hashPassword();
            await this.userRepository.save(user);

            response.status(204).send({ message: "Password changed successfully" });
        } catch (error) {
            response.status(401).send({ message: "Unauthorized" });
        }
    }

}
