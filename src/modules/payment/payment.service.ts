import type Stripe from "stripe";
import { PaymentStatus } from "../../generated/prisma/client/browser";
import { prisma } from "../../lib/prisma";
import { logger } from "../../shared/logger/logger";

class PaymentService {
  public handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        stripeEventId: event.id,
      },
    });

    if (existingPayment) {
      logger.warn(
        `Stripe event ${event.id} has already been processed. Skipping.`,
      );
      return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const appointmentId = session.metadata?.appointmentId;

        const paymentId = session.metadata?.paymentId;

        if (!appointmentId || !paymentId) {
          console.error(
            "Missing appointmentId or paymentId in session metadata",
          );
          return {
            message: "Missing appointmentId or paymentId in session metadata",
          };
        }

        const appointment = await prisma.appointment.findUnique({
          where: {
            id: appointmentId,
          },
        });

        if (!appointment) {
          console.error(`Appointment with id ${appointmentId} not found`);
          return { message: `Appointment with id ${appointmentId} not found` };
        }

        await prisma.$transaction(async (tx) => {
          await tx.appointment.update({
            where: {
              id: appointmentId,
            },
            data: {
              paymentStatus:
                session.payment_status === "paid"
                  ? PaymentStatus.PAID
                  : PaymentStatus.UNPAID,
            },
          });

          await tx.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              stripeEventId: event.id,
              status:
                session.payment_status === "paid"
                  ? PaymentStatus.PAID
                  : PaymentStatus.UNPAID,
              paymentGatewayData: session as any,
            },
          });
        });
        logger.info(
          `Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`,
        );
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;

        logger.info(
          `Checkout session ${session.id} expired. Marking associated payment as failed.`,
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const session = event.data.object;

        logger.info(
          `Payment intent ${session.id} failed. Marking associated payment as failed.`,
        );
        break;
      }
      default:
        logger.warn(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
  };
}

export default PaymentService;
