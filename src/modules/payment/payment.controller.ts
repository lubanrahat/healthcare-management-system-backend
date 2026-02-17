import { catchAsync } from "../../shared/utils/async-handler.util";
import type { Request, Response } from "express";
import HttpStatus from "../../shared/constants/http-status";
import { env } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { ResponseUtil } from "../../shared/utils/response.util";
import PaymentService from "./payment.service";

class PaymentController {
  public handleStripeWebhookEvent = catchAsync(
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"] as string;
      const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !webhookSecret) {
        console.error("Missing Stripe signature or webhook secret");
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Missing Stripe signature or webhook secret" });
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret,
        );
      } catch (error: any) {
        console.error("Error processing Stripe webhook:", error);
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Error processing Stripe webhook" });
      }

      try {
        const paymentService = new PaymentService();
        const result = await paymentService.handlerStripeWebhookEvent(event);

        ResponseUtil.success(
          res,
          result,
          "Stripe webhook event processed successfully",
          HttpStatus.OK,
        );
      } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        ResponseUtil.error(
          res,
          "Error handling Stripe webhook event",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    },
  );
}

export default new PaymentController();
