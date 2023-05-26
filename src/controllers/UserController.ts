import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator";

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find({
            select: ["id", "username", "role"] //We dont want to send the passwords on response
        });
    }

    async one(request: Request, response: Response, next: NextFunction) {
        //Get the ID from the url
        const id = parseInt(request.params.id)

        //Get the user from database
        try {
            const user = await this.userRepository.findOneOrFail({
                where: { id },
                select: ["id", "username", "role"] //We dont want to send the password on response
            });
            return user

        } catch (error) {
            response.status(404).send("User not found");
        }
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const { username, password, role } = request.body;

        const user = Object.assign(new User(), {
            username: username,
            password: password,
            role: role
        });

        try {
            const errors = await validate(user);
            if (errors.length > 0) {
                response.status(400).send(errors);
            } else {
                user.hashPassword();
                await this.userRepository.save(user);
                response.status(201).send("User created");
            }
        } catch (error) {
            response.status(409).send("Username already in use");
        }
    }

    async edit(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        const { username, role } = request.body;

        try {
            let user = await this.userRepository.findOneOrFail({ where: { id } });

            user.username = username;
            user.role = role;

            const errors = await validate(user);
            if (errors.length > 0) {
                response.status(400).send(errors);
            } else {
                await this.userRepository.save(user);
                response.status(204).send("User updated");
            }
        } catch (error) {
            response.status(404).send("User not found");
        }
    }


    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);

        try {
            let userToRemove = await this.userRepository.findOne({ where: { id } });

            if (!userToRemove) {
                response.status(404).send("User not found");
            } else {
                await this.userRepository.remove(userToRemove);
                response.status(204).send("User has been removed");
            }
        } catch (error) {
            response.status(500).send("An error occurred while removing the user");
        }
    }

}
