import Mailgen from "mailgen";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env";
import type { MailgenContent } from "../types/mail.types";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailOptions {
  email: string;
  subject: string;
  mailgenContent: MailgenContent;
  attachments?: EmailAttachment[];
}

const transporter: Transporter = nodemailer.createTransport({
  host: env.MAILTRAP_HOST,
  port: Number(env.MAILTRAP_PORT),
  secure: false,
  auth: {
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
  },
});

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Healthcare Management System",
    link: "https://healthcare-management-system.com",
  },
});

const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  try {
    await transporter.sendMail({
      from: "mail.healthcare-management-system@example.com",
      to: options.email,
      subject: options.subject,
      text: emailText,
      html: emailHtml,
      attachments: options.attachments || [],
    });
  } catch (error) {
    console.error("Email service failed.");
    console.error(error);
    throw error; // Important for production error tracking
  }
};

const emailVerificationMailgenContent = (
  username: string,
  verificationUrl: string,
): MailgenContent => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Healthcare Management System! Your account has been created successfully.",
      action: {
        instructions:
          "To activate your account, please verify your email address by clicking the button below:",
        button: {
          color: "#4F46E5",
          text: "Verify Email Address",
          link: verificationUrl,
        },
      },
      outro:
        "If you didn’t create this account, you can safely ignore this email.",
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
      intro: "Use the One-Time Password (OTP) below to verify your account.",
      dictionary: {
        "One-Time Password (OTP)": otp,
        Validity: "5 minutes",
      },
      outro: "Do not share this OTP with anyone. It will expire in 5 minutes.",
    },
  };
};

const forgotPasswordOtpMailgenContent = (
  username: string,
  otp: string,
): MailgenContent => {
  return {
    body: {
      name: username,
      intro: [
        "We received a request to reset your password.",
        "Use the OTP below to continue:",
      ],
      dictionary: {
        OTP: otp,
        Validity: "5 minutes",
      },
      outro:
        "If you did not request a password reset, please ignore this email.",
    },
  };
};
interface PrescriptionTemplateProps {
  patientName: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  followUpDate: string;
  issuedDate: string;
  prescriptionId: string;
}

const prescriptionMailgenContent = (
  data: PrescriptionTemplateProps,
): MailgenContent => {
  return {
    body: {
      name: data.patientName,
      intro: `Dr. ${data.doctorName} (${data.specialization}) has issued a new prescription.`,
      dictionary: {
        "Prescription ID": data.prescriptionId,
        "Appointment Date": data.appointmentDate,
        "Issued Date": data.issuedDate,
        "Follow-up Date": data.followUpDate,
      },
      outro:
        "Please find the attached prescription PDF. Contact your doctor if you have any questions.",
    },
  };
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  otpVerificationMailgenContent,
  forgotPasswordOtpMailgenContent,
  prescriptionMailgenContent,
};
