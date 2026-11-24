import dotenv from "dotenv";

dotenv.config({ path: [`.${process.env.NODE_ENV ?? "dev"}.env`, ".env"] });

const adminJwt = {
  accessTokenSecret: process.env.ADMIN_ACCESS_TOKEN_SECRET as string,
  accessTokenExpiresIn: process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN as string,
  refreshTokenSecret: process.env.ADMIN_REFRESH_TOKEN_SECRET as string,
  refreshTokenExpiresIn: process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN as string,
};

const envConfig = {
  database: {
    uri: process.env.MONGO_URI ?? "mongodb://localhost/test_db",
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY as string,
    iv: parseInt(process.env.IV_LENGTH as string),
  },
  jwt: {
    user: {
      accessTokenSecret: process.env.USER_ACCESS_TOKEN_SECRET as string,
      accessTokenExpiresIn: process.env.USER_ACCESS_TOKEN_EXPIRES_IN as string,
      refreshTokenSecret: process.env.USER_REFRESH_TOKEN_SECRET as string,
      refreshTokenExpiresIn: process.env.USER_REFRESH_TOKEN_EXPIRES_IN as string,
    },
    admin: adminJwt,
    super_admin: adminJwt,
  },
  GCP: {
    client_id: process.env.GCP_CLIENT_ID as string,
  },
  redis: {
    url: process.env.REDIS_CLOUD_URL as string,
  },
  email: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
  port: process.env.PORT ?? 3000,
  s3bucket :{
accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
bucketName: process.env.AWS_BUCKET_NAME ?? '',
bucketRegion: process.env.AWS_REGION ?? ''
  },
  google: {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
},
  
};

export default envConfig;