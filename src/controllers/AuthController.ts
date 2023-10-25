import { Request, Response, NextFunction } from "express";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export class AuthController {
  private static cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION, // e.g. 'us-east-1'
  });

  async refreshTokens(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
      console.log("refreshTokens");
    const refreshToken = request.body.refresh_token;
    if (!refreshToken) {
      return response.status(400).json({ error: "Refresh token is required" });
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    try {
      const authResult = await AuthController.cognito.send(command);

      if (authResult.AuthenticationResult) {
        const tokens = {
          access_token: authResult.AuthenticationResult.AccessToken,
          id_token: authResult.AuthenticationResult.IdToken,
          refresh_token: refreshToken,
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
