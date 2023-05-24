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
        } catch (error) {
            response.status(404).send("User not found");
        }
    }

    //     if (!user) {
    //         return "unregistered user"
    //     }
    //     return user
    // }

    async save(request: Request, response: Response, next: NextFunction) {
        //Get parameters from the body
        const { username, password, role } = request.body;

        const user = Object.assign(new User(), {
            username: username,
            password: password,
            role: role
        })

        //Validade if the parameters are ok
        const errors = await validate(user);
        if (errors.length > 0) {
            return errors
        }

        //Hash the password, to securely store on DB
        user.hashPassword();

        //Try to save. If fails, the username is already in use
        try {
            await this.userRepository.save(user);
        } catch (e) {
            response.status(409).send("username already in use");
            return "username already in use"
        }

        //If all ok, send 201 response
        response.status(201).send("User created");
        return "user created"
    }



    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)

        let userToRemove = await this.userRepository.findOneBy({ id })

        if (!userToRemove) {
            return "this user not exist"
        }

        await this.userRepository.remove(userToRemove)

        return "user has been removed"
    }

}