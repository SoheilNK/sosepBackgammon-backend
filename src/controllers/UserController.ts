import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator";



// import axois from 'axios';

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    async getUser(request: Request, response: Response, next: NextFunction) {
        console.log("get user data after checking token")
        let result = response.locals.result
        let email = result.email
        console.log('result from getUser(): ' + JSON.stringify(result))
        let username = result.userName
        console.log('result from getUser(): ' + username)
        //get user from database
        try {
            const user = await this.userRepository.findOneOrFail({ where: { username } });
            response.status(200).send(user)
        } catch (error) {
            // response.status(404).send({ message: "User not found in data base" });
            
            console.log('user not found in database')
            const user = Object.assign(new User(), {
                username: username,
                email: email,
                role: "USER"
            });
            //add user to database
            await this.addUser(user)
            //get user from database
            const newuser = await this.userRepository.findOneOrFail({ where: { username } });
            response.status(200).send(newuser)
            
            // response.status(200).send(newuser)
        }
    }

    async addUser(user: User) {

        try {
            const errors = await validate(user);
            if (errors.length > 0) {
                return errors;
            } else {
                await this.userRepository.save(user);
                console.log(`You have successfully added user "${user.username}" to database`)
                return user       
            }
        } catch (error) {
            console.log(`Username "${user.username}" already in use`)
        }
    }


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
