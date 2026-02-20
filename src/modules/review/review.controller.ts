import type { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/async-handler.util";
import ReviewService from "./review.service";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";
import type { IRequestUser } from "../../shared/interfaces/requestUser.interface";

class ReviewConstant {
  public giveReview = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const service = new ReviewService();
    const result = await service.giveReview(user, payload);
    return ResponseUtil.success(
      res,
      result,
      "Review given successfully",
      HttpStatus.CREATED,
    );
  });
  public getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const service = new ReviewService();
    const result = await service.getAllReviews();
    return ResponseUtil.success(
      res,
      result,
      "Reviews fetched successfully",
      HttpStatus.OK,
    );
  });
  public myReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const service = new ReviewService();
    const result = await service.myReviews(user);
    return ResponseUtil.success(
      res,
      result,
      "My reviews fetched successfully",
      HttpStatus.OK,
    );
  });
  public updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.id;
    const payload = req.body;
    const service = new ReviewService();
    const result = await service.updateReview(
      user,
      reviewId as string,
      payload,
    );
    return ResponseUtil.success(
      res,
      result,
      "Review updated successfully",
      HttpStatus.OK,
    );
  });
}

export default ReviewConstant;
