import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator";

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    async all(request: Request, response: Response, next: NextFunction) {
        try {
            const users = this.userRepository.find({
                select: ["id", "username", "role"] //We dont want to send the passwords on response
            });
            return users;

        } catch (error) {
            response.status(404).send({ message: "Users not found" });
            return error
        }
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
            response.status(404).send({ message: "User not found" });
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
                response.status(204).send({ message: "User updated" });
            }
        } catch (error) {
            response.status(404).send({ message: "User not found" });
        }
    }


    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);

        try {
            let userToRemove = await this.userRepository.findOne({ where: { id } });

            if (!userToRemove) {
                response.status(404).send({ message: "User not found" });
            } else {
                await this.userRepository.remove(userToRemove);
                response.status(204).send({ message: "User has been removed" });
            }
        } catch (error) {
            response.status(500).send({ message: "An error occurred while removing the user" });
        }
    }

}
