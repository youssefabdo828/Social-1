import  { Jwt, JwtPayload, PrivateKey,PublicKey,Secret, SignOptions, VerifyOptions }  from 'jsonwebtoken';
import { FollowStatusEnum, GenderEnum, ProvidersEnum, RoleEnum, TokenTypeEnum } from './enum';
import { Document,Types } from 'mongoose';
import type { Request } from "express";


export interface IGenerateTokenPayload {

 payload: string | Buffer | object;
 secret: Secret | PrivateKey;
 options?: SignOptions;
}


export interface IVerifyTokenPayload {
  token: string;
  secret: Secret | PublicKey;
  options?: VerifyOptions;
}





export interface IVerifyResponse extends JwtPayload {
  _id: string;
  email: string;
  role: RoleEnum;
}



export interface IDecodeTokenPayload {
  token: string;
  tokenType: TokenTypeEnum;
}


export interface ISignaturePayload {
  role: string;
  tokenType: TokenTypeEnum;
}

export interface ISignatures{
    accessTokenSecret: string | undefined;
    refreshTokenSecret: string | undefined;
    accessTokenExpiresIn: string | undefined;
    refreshTokenExpiresIn: string | undefined;
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  fullName?: string;
  email: string;
  password: string;
  gender: GenderEnum;
  age?: number;
  profilePicture?: string;
  coverPictures?: [string];
  phoneNumber?: string;
  role: RoleEnum;
  googleSub?: string;
  provider: ProvidersEnum;
  isEmailVerified: boolean;
  isTwoStepEnabled: boolean;
  isPrivate: boolean;
}

declare global {
  namespace Express {
    interface Request {
      authUser: IUser;
      accessTokenData: IVerifyResponse;
      refreshTokenData: IVerifyResponse;
      validate?: any;
    }
  }
}

export interface IAuth extends Request {
    authUser: IUser
    accessTokenData: IVerifyResponse
}




export interface IFollow extends Document {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  status: FollowStatusEnum;
}

export {};