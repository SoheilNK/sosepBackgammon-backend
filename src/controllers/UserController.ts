import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator";

import { CognitoIdentityServiceProvider } from "aws-sdk";
export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async getUser(request: Request, response: Response, next: NextFunction) {
    console.log("get user data after checking token");
    let result = response.locals.result;
    let email = result.email;
    console.log("result from getUser(): " + JSON.stringify(result));
    let username = result.userName;
    console.log("result from getUser(): " + username);
    //get user from database
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { username },
      });
      response.status(200).send(user);
    } catch (error) {
      // response.status(404).send({ message: "User not found in data base" });

      console.log("user not found in database");
      const user = Object.assign(new User(), {
        username: username,
        email: email,
        role: "USER",
      });
      //add user to database
      await this.addUser(user);
      //get user from database
      const newuser = await this.userRepository.findOneOrFail({
        where: { username },
      });
      response.status(200).send(newuser);

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
        console.log(
          `You have successfully added user "${user.username}" to database`
        );
        return user;
      }
    } catch (error) {
      console.log(`Username "${user.username}" already in use`);
    }
  }

  async all(request: Request, response: Response, next: NextFunction) {
    try {
      const users = this.userRepository.find({
        select: ["id", "username", "role"], //We dont want to send the passwords on response
      });
      return users;
    } catch (error) {
      response.status(404).send({ message: "Users not found" });
      return error;
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
      response
        .status(500)
        .send({ message: "An error occurred while removing the user" });
    }
  }
//to be deleted
  async refreshToken(request: Request, response: Response) {
    const refreshToken = request.body.refresh_token;
    if (!refreshToken) {
      return response.status(400).json({ error: "Refresh token is required" });
    }

    // AWS Cognito configuration
    const COGNITO_REGION = process.env.AWS_REGION; // e.g. 'us-east-1'
    const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID;
    const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;

    const cognito = new CognitoIdentityServiceProvider({
      region: COGNITO_REGION,
    });

    const params: CognitoIdentityServiceProvider.InitiateAuthRequest = {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    try {
      const authResult = await cognito.initiateAuth(params).promise();

      if (authResult.AuthenticationResult) {
        const tokens = {
          access_token: authResult.AuthenticationResult.AccessToken,
          id_token: authResult.AuthenticationResult.IdToken,
          refresh_token: refreshToken, // Optionally return the same refresh token
        };
        return response.json(tokens);
      } else {
        return response.status(400).json({ error: "Failed to refresh token" });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
