import type { RequestHandler } from "express";
import { BadRequestException } from "../common/Utils/Errors/exception.error";
import { TokenTypeEnum } from "../common/types/enum";
import TokenService from "../common/Services/token.service";

const tokenService = new TokenService();

export const decodeRefreshToken: RequestHandler = async (req, res, next) => {

  const refreshtoken = req.headers.refreshtoken;
  if (!refreshtoken || typeof refreshtoken !== "string") {
    throw new BadRequestException("Refresh token header is missing", null, "UNAUTHORIZED");
  }

  const [prefix, token] = refreshtoken.split(" ");
  if (prefix !== "Bearer" || !token) {
    throw new BadRequestException("Invalid authorization header format", null, "UNAUTHORIZED");
  }

const { TokenData } = await tokenService.decodeToken({
  token,
  tokenType: TokenTypeEnum.REFRESH_TOKEN,
});

  req.refreshTokenData = TokenData;
  next();
};
