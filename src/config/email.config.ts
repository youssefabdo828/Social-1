import SMTPTransport from "nodemailer/lib/smtp-transport";
import envConfig from "./env.config";

const { email } = envConfig;

export const emailConfig: SMTPTransport.Options = {
  service: "gmail",
  auth: {
    user: email.user,
    pass: email.pass,
  },
};