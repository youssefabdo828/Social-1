import { BadRequestException, ConflictException } from "../../common/Utils/Errors/exception.error";
import UserRepository from "../../DB/Repositories/user.repository";
import { SignUpBody } from "./auth.dto";
import SecurityService from "../../common/Services/security.service";
import { eventEmitter } from "../../common/Services/email.service";
import { emailOTPExpiration, TokenTypeEnum } from "../../common/types/enum";
import crypto from "crypto";
import RedisService from "../../common/Services/radis.service";
import TokenService from "../../common/Services/token.service";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import envConfig from "../../config/env.config";
import { UserDocument } from "../../DB/models/user.model";
import { IUser } from "../../common/types/interfaces.types";
import { uuidv4 } from "zod/v4/mini";
import { OAuth2Client } from "google-auth-library";
import { ProvidersEnum } from "../../common/types/enum";

const userEnvConfig = envConfig.jwt.user;

class AuthenticationService {
    private userRepo = new UserRepository();
    private securityService = new SecurityService();
private redisService = new RedisService();
private tokenService = new TokenService();
private googleClient = new OAuth2Client();

    healthCheck() {
        return { message: "Auth service is healthy" };
    }

async handleSendingVerificationOtp(
  email: string,
  keyPrefix = "email_verification",
  subject = "Email Verification",
): Promise<void> {

  const otp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await this.securityService.hash(otp);

  eventEmitter.emit("sendMailEvent", {
    to: email,
    subject,
    html: `
<h1>This is your ${subject} OTP</h1>
<h2>${otp}</h2>
<h3>This otp valid for 5 minutes</h3>`,
  });


  await this.redisService.set({
    key: `${keyPrefix}:${email}`,
    value: hashedOtp,
    options: { EX: emailOTPExpiration },
  });
}

    async signUp(body: SignUpBody) {
const { firstName, lastName,    email, password, gender, age, phone } = body;

  const existingUser = await this.userRepo.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictException(
      "User with this email already exists",
      { duplicatedEmail: email },
      "EMAIL_CONFLICT"
    );
  }



   await this.handleSendingVerificationOtp(email);
 
  return this.userRepo.createNewDocument({
    firstName,
    lastName,
    email,
    password,
    gender,
    age,
    phoneNumber: phone,
  })};


 buildTokens (user: Partial<IUser>) {
  const payload = { _Id: user._id, email: user.email, role: user.role };

  const accessToken = this.tokenService.generateToken({ payload, secret: userEnvConfig.accessTokenSecret, options: {expiresIn: userEnvConfig.accessTokenExpiresIn as SignOptions["expiresIn"], jwtid: crypto.randomUUID() } });
  const refreshToken = this.tokenService.generateToken({ payload, secret: userEnvConfig.refreshTokenSecret, options: {expiresIn: userEnvConfig.refreshTokenExpiresIn as SignOptions["expiresIn"], jwtid: crypto.randomUUID() } });
  return { accessToken, refreshToken };
};


 async login (body: { email: string; password: string }) {
  const { email, password } = body;

  const isEmailExist = await this.userRepo.findOneDocument({ email });


  if (!isEmailExist)
    
    throw new BadRequestException(
      "Invalid email or password",
      null,
      "UNAuthorized",
    );



  const isPasswordMatched = await this.securityService.compareTwoHashes(isEmailExist.password, password);

  if (!isPasswordMatched)
    throw new BadRequestException(
      "Invalid email or password",
      null,
      "UNAuthorized",
    );
  return this.buildTokens(isEmailExist);
};



logout = async (accessTokenData: JwtPayload, refreshTokenData: JwtPayload) => {
  const { exp: accessExpiration, jti: accessId } = accessTokenData;
  const { exp: refreshExpiration, jti: refreshId } = refreshTokenData;

  if (!accessExpiration || !refreshExpiration || !accessId || !refreshId) {
    throw new BadRequestException("Invalid token data", null, "INVALID_TOKEN");
  }

  const accessTTL = this.redisService.calculateTTL(accessExpiration);
  const refreshTTL = this.redisService.calculateTTL(refreshExpiration);

  await Promise.all([
    this.redisService.set({
      key: `bl_${TokenTypeEnum.ACCESS_TOKEN}_${accessId}`,
      value: "true",
      options: { EX: accessTTL },
    }),
    this.redisService.set({
      key: `bl_${TokenTypeEnum.REFRESH_TOKEN}_${refreshId}`,
      value: "true",
      options: { EX: refreshTTL },
    }),
  ]);

  return { accessTTL, refreshTTL };
};

confirmEmail = async (email: string, otp: string | number) => {
  const hashedOtp = await this.redisService.get(`email_verification:${email}`);
  if (!hashedOtp) {
    throw new BadRequestException("Invalid email or your otp is expired", null, "OTP_EXPIRATION");
  }

  const isValidOtp = await this.securityService.compareTwoHashes(hashedOtp, otp.toString());
  if (!isValidOtp) throw new BadRequestException("Invalid otp", null, "OTP_INVALID");

  await this.userRepo.updateOneDocument({ email }, { isEmailVerified: true });

  await this.redisService.del(`email_verification:${email}`);

  return true;
};


resendEmail = async (email: string) => {
  const user = await this.userRepo.findUserByEmail(email);
  if (!user) throw new BadRequestException("Invalid email", null, "INVALID_EMAIL");

  if (user.isEmailVerified) {
    throw new BadRequestException("Email is already verified", null, "EMAIL_ALREADY_VERIFIED");
  }

  const cooldownKey = `resend_cooldown:${email}`;
  const isCoolingDown = await this.redisService.get(cooldownKey);
  if (isCoolingDown) {
    const remaining = await this.redisService.TTL(cooldownKey);
    throw new BadRequestException(
      `Please wait ${remaining} seconds before requesting a new code`,
      null,
      "RESEND_TOO_SOON"
    );
  }}




refreshAccessToken = async (token: string) => {
  const { user, TokenData } = await this.tokenService.decodeToken({
    token,
    tokenType: TokenTypeEnum.REFRESH_TOKEN,
  });

  const role = TokenData.role ?? user.role;
  const roleConfig = this.tokenService.detectRoleSecrets(role);

  const accessToken = this.tokenService.generateToken({
    payload: { _id: user._id, email: user.email, role },
    secret: roleConfig.accessTokenSecret as string,
    options: {
      expiresIn: roleConfig.accessTokenExpiresIn as SignOptions["expiresIn"],
      jwtid: crypto.randomUUID(),
    },
  });

  return { accessToken };
};



forgotPassword = async (email: string) => {
  const user = await this.userRepo.findUserByEmail(email);

  if (!user) return true;

  const key = `forgot_password:${email}`;


  const remaining = await this.redisService.TTL(key);
  if (remaining > 0 && emailOTPExpiration - remaining < 60) {
    throw new BadRequestException(
      "Please wait before requesting another code",
      { retryAfterSeconds: 60 - (emailOTPExpiration - remaining) },
      "RESET_TOO_SOON",
    );
  }

  await this.handleSendingVerificationOtp(email, "forgot_password", "Password Reset");
  return true;
};

resetPassword = async (email: string, otp: string, newPassword: string) => {
  const key = `forgot_password:${email}`;

  const hashedOtp = await this.redisService.get(key);
  if (!hashedOtp) {
    throw new BadRequestException("Invalid email or your otp is expired", null, "OTP_EXPIRATION");
  }

  const isValidOtp = await this.securityService.compareTwoHashes(hashedOtp, otp.toString());
  if (!isValidOtp) throw new BadRequestException("Invalid otp", null, "OTP_INVALID");

  const user = await this.userRepo.findUserByEmail(email);
  if (!user) {
    throw new BadRequestException("Invalid email or your otp is expired", null, "OTP_EXPIRATION");
  }

  const isSamePassword = await this.securityService.compareTwoHashes(user.password, newPassword);
  if (isSamePassword) {
    throw new BadRequestException(
      "New password must be different from the old one",
      null,
      "SAME_PASSWORD",
    );
  }

  const hashedPassword = await this.securityService.hash(newPassword);
  await this.userRepo.updateOneDocument({ email }, { password: hashedPassword });

  await this.redisService.del(key);
  return true;
};




private verifyGoogleIdToken = async (idToken: string) => {
  try {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: envConfig.google.clientId,
    });
    return ticket.getPayload();
  } catch {
    throw new BadRequestException("Invalid Google token", null, "INVALID_GOOGLE_TOKEN");
  }
};

googleSignIn = async (idToken: string) => {
  const payload = await this.verifyGoogleIdToken(idToken);

  if (!payload || !payload.email || !payload.email_verified) {
    throw new BadRequestException(
      "Google email is not verified",
      null,
      "GOOGLE_EMAIL_NOT_VERIFIED",
    );
  }

  const { email, sub, given_name, family_name } = payload;


  let user = await this.userRepo.findOneDocument({
    googleSub: sub,
    provider: ProvidersEnum.GOOGLE,
  });

  if (!user) {

    const existingUser = await this.userRepo.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        "This email is registered with a password. Please login with email and password",
        { email },
        "EMAIL_CONFLICT",
      );
    }


    const randomPassword = await this.securityService.hash(
      crypto.randomBytes(12).toString("hex"),
    );

user = await this.userRepo.createNewDocument({
  firstName: given_name || email.split("@")[0],
  lastName: family_name,
  email,
  googleSub: sub,
  provider: ProvidersEnum.GOOGLE,
  password: crypto.randomBytes(12).toString("hex"),
  isEmailVerified: true,
});
  }

  return this.buildTokens(user);
};


}


export default new AuthenticationService();