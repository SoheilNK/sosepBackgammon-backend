import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator";
import * as jwt from "jsonwebtoken";
import * as jwkToPem from "jwk-to-pem";
import fetch from 'node-fetch';



// import axois from 'axios';

export class UserController {

    private userRepository = AppDataSource.getRepository(User)

    // getOpenIdConfig = async () => {
    //     // const openIdConfigUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/openid-configuration`;
    //     const openIdConfigUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}/.well-known/openid-configuration`;
    //     const openIdConfigResponse = await fetch(openIdConfigUrl);
    //     const openIdJson = await openIdConfigResponse.json() as {
    //         jwks_uri: string;
    //     };

    //     const jwksResponse = await fetch(openIdJson.jwks_uri);
    //     const jwks = await jwksResponse.json();


    //     return {
    //         openIdJson,
    //         jwks,
    //     };
    // }

    // //check signature of token and return user ID if valid
    // // Assuming the class containing this method is named "YourClass"
    // async checktoken(request: Request, response: Response, next: NextFunction) {
    //     const auth_token = request.headers.authorization.split("Bearer ")[1] as string;
    //     const openIdConfig = await this.getOpenIdConfig() as { openIdJson: { jwks_uri: string; }; jwks: { keys: { kid: string; }[]; }; };

    //     // Get the jwk used for the signature
    //     const decoded = jwt.decode(auth_token, { complete: true }) as { header: jwt.JwtHeader; payload: jwt.JwtPayload };
    //     const jwk = openIdConfig.jwks.keys.find(({ kid }) => kid === decoded.header.kid);

    //     if (!jwk) {
    //         throw new Error('Invalid token');
    //     }

    //     const pem = jwkToPem(jwk);
    //     const token_use = decoded.payload.token_use;

    //     // Continue with your code logic
    // }
    async getUserId(request: Request, response: Response, next: NextFunction) {
        console.log("get user id after checking token")
        
        
        return response.locals.result

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
