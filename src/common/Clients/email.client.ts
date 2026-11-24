import nodemailer from "nodemailer";
import { emailConfig } from "../../config/email.config";

export const emailTransporter = nodemailer.createTransport(emailConfig);