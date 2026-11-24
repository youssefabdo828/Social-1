import { EventEmitter } from "node:events";
import type Mail from "nodemailer/lib/mailer";
import { emailTransporter } from "../Clients/email.client";
import { BadRequestException } from "../Utils/Errors/exception.error";
import envConfig from "../../config/env.config";
import { SendMailOptions } from "nodemailer/lib/mailer";


const { email } = envConfig;



export const sendEmail = async ({
  to,
  subject = "No reply",
  html = "",
  attachments = [],
}: SendMailOptions) => {
  if (!html && !attachments.length) {
    throw new BadRequestException(
      "Message or attachments are required",
      null,
      "SEND_MAIL_ERROR"
    );
  }

  try {
    const info = await emailTransporter.sendMail({
      from: `"NO-reply" <${email.user}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (err: any) {
    console.error("Error while sending mail:", err);
    throw new BadRequestException("Error while sending mail", null, "SEND_MAIL_ERROR");
  }
};

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendMailEvent", (data: SendMailOptions) => {
  sendEmail(data).catch((err) => {
    console.error("sendMailEvent failed:", err);
  });
  console.log("data received successfully");
});