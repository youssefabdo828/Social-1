import type {RequestHandler } from "express";
import { BadRequestException } from "../common/Utils/Errors/exception.error";
import TokenService from "../common/Services/token.service";
import { TokenTypeEnum } from "../common/types/enum";
import { IAuth } from "../common/types/interfaces.types";

const tokenService = new TokenService();


export const authenticate: RequestHandler = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    throw new BadRequestException("Authorization header is missing", null, "UNAUTHORIZED");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer" || !token) {
    throw new BadRequestException("Invalid authorization header format", null, "UNAUTHORIZED");
  }

  const { user, TokenData } = await tokenService.decodeToken({
    token,
    tokenType: TokenTypeEnum.ACCESS_TOKEN,
  });

const authenticatedRequest = req as IAuth

  req.authUser = user;
  req.accessTokenData = TokenData;
  next();
};