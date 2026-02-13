import Mailgen from "mailgen";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env";
import type { MailgenContent, SendEmailOptions } from "../types/mail.types";

const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Healthcare management system",
      link: "https://healthcare-management-system.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter: Transporter = nodemailer.createTransport({
    host: env.MAILTRAP_HOST,
    port: Number(env.MAILTRAP_PORT),
    secure: false,
    auth: {
      user: env.MAILTRAP_USER,
      pass: env.MAILTRAP_PASS,
    },
  });

  const mail = {
    from: "mail.healthcare-management-system@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error:", error);
  }
};

//Mailgen Contents

const emailVerificationMailgenContent = (
  username: string,
  verificationUrl: string,
): MailgenContent => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Prisma Blog! Your account has been created successfully.",

      action: {
        instructions:
          "To activate your account and start publishing posts, please verify your email address by clicking the button below:",
        button: {
          color: "#4F46E5",
          text: "Verify Email Address",
          link: verificationUrl,
        },
      },

      outro:
        "If you didn’t create this account, you can safely ignore this email. Need help? Just reply and our team will assist you.",
    },
  };
};

const otpVerificationMailgenContent = (
  username: string,
  otp: string,
): MailgenContent => {
  return {
    body: {
      name: username,

      intro:
        "Welcome to Healthcare Management System! Your account has been created successfully.",

      dictionary: {
        "One-Time Password (OTP)": otp,
        Validity: "5 minutes",
      },

      action: {
        instructions:
          "Please enter the OTP above on the verification page to activate your account.",
        button: {
          color: "#16A34A", // healthcare green
          text: "Verify Account",
          link: "https://your-frontend-url.com/verify-otp",
        },
      },

      outro: [
        "This OTP is confidential. Do not share it with anyone.",
        "If you did not create this account, please ignore this email.",
        "Need help? Contact our support team anytime.",
      ],
    },
  };
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  otpVerificationMailgenContent,
};
