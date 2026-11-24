    import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
    import UserRepository from "../../DB/Repositories/user.repository";
    import type { UserDocument } from "../../DB/models/user.model";
    import { RoleEnum, TokenTypeEnum } from "../types/enum";
    import envConfig from "../../config/env.config";
    import get  from "../Services/radis.service";

    import { IDecodeTokenPayload, ISignatures, IVerifyResponse, IVerifyTokenPayload } from "../types/interfaces.types";
    import { IGenerateTokenPayload } from "../types/interfaces.types";
    import { ISignaturePayload } from './../types/interfaces.types';
import { BadRequestException, UnauthorizedException } from "../Utils/Errors/exception.error";
import RedisService from './radis.service';


    const jwtConfig = envConfig.jwt;

class   TokenService {

    
    private userRepo = new UserRepository();
    private radisService = new RedisService();

    

    
 generateToken = ({ payload = {}, secret = '', options = {} }: IGenerateTokenPayload): string => {
      return jwt.sign(payload, secret, options);
    };
    
  verifyToken = ({ token, secret, options }: IVerifyTokenPayload): IVerifyResponse => {
  return jwt.verify(token, secret, options) as IVerifyResponse;
};
    
    
    
detectRoleSecrets = (role: string): ISignatures => {
  const map: Record<string, ISignatures> = {
    [RoleEnum.USER]: jwtConfig.user,
    [RoleEnum.ADMIN]: jwtConfig.admin,
    [RoleEnum.SUPER_ADMIN]: jwtConfig.super_admin,
  };

  const signatures = map[role?.trim()];
  if (!signatures) {
    throw new BadRequestException(`Invalid role in token: ${role}`, null, "INVALID_ROLE");
  }
  return signatures;
};



 getSignatureByRoleAndType = ({role,tokenType}: ISignaturePayload) => {
      const roleSignatures = this.detectRoleSecrets(role);
      if (!roleSignatures) {
        throw new BadRequestException("Invalid role in token", null, "INVALID_ROLE");
      }
    
      switch (tokenType) {
        case TokenTypeEnum.ACCESS_TOKEN:
          return roleSignatures.accessTokenSecret;
        case TokenTypeEnum.REFRESH_TOKEN:
          return roleSignatures.refreshTokenSecret;
        default:
          throw new BadRequestException("Invalid token type", null, "INVALID_TOKEN_TYPE");
      }
    };
    
 decodeToken = async ({token, tokenType}: IDecodeTokenPayload) => {
      const data = jwt.decode(token);
      const role = (data as {role: string})?.role;
      if (!role) {
        throw new BadRequestException("role is missing in token", null, "ROLE_MISSING");
      }
    
      const signature: string = this.getSignatureByRoleAndType({ role, tokenType }) as string;
    
      const decodedData = this.verifyToken({ token, secret: signature });
    
      const isTokenBlacklisted = await this.radisService.get(`bl_${tokenType}_${decodedData.jti}`);
      if (isTokenBlacklisted) {
        throw new UnauthorizedException(
          "Token is revoked try logging in again",
          null,
          "TOKEN_BLACKLISTED"
        );
      }
    
      const user = await this.userRepo.findDocumentById({ _id: decodedData._Id , projection: { password: 0 } })
      if (!user) {
        throw new BadRequestException("User not found", null, "UNAUTHORIZED");
      }
    
      return {user ,TokenData: decodedData };
    };

}


export default TokenService;
