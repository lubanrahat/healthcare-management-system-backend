import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "../generated/prisma/client/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { forgotPasswordOtpMailgenContent, otpVerificationMailgenContent, sendEmail } from "../shared/utils/mail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.PATIENT,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        
        if(type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if(user && !user.emailVerified) {

            await sendEmail({
              email: user.email,
              subject: "Verify your email address",
              mailgenContent: otpVerificationMailgenContent(user.name, otp),
            });

          }
        } else if(type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if(user) {

            await sendEmail({
              email: user.email,
              subject: "Reset your password",
              mailgenContent: forgotPasswordOtpMailgenContent(user.name, otp),
            });
          }
        }
        
      },
      expiresIn: 5 * 60, // 5 minutes in seconds
      otpLength: 6,
    })

  ],

  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    },
  },
});
