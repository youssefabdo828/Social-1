import type { RequestHandler } from "express";
import { UnauthorizedException } from "../common/Utils/Errors/exception.error";
import { RoleEnum } from "../common/types/enum";


export const authorize = (allowedRoles: RoleEnum[]): RequestHandler => {
  return (req, res, next) => {
    const loggedInUserRole = req.authUser.role;
    if (!allowedRoles.includes(loggedInUserRole)) {
      throw new UnauthorizedException(
        "You are not authorized to perform this action",
        null,
        "UNAUTHORIZED"
      );
    }
    next();
  };
};
