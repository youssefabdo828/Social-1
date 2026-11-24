export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
}

export enum ProvidersEnum {
  SYSTEM = "system",
  GOOGLE = "google",
}

export enum RoleEnum {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum TokenTypeEnum {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
}

export enum FollowStatusEnum {
  PENDING = "pending",
  ACCEPTED = "accepted",
}


export const emailOTPExpiration = 300;

export const allowedExtension: Record<string, string[]> = {
  image: ["png", "jpeg"],
  video: ["mp4"],
  application: ["xlsx", "pdf"],
};