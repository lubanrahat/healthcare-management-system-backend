import express, { type Router } from "express";

import { withAuth } from "../../shared/middlewares/auth.middleware";
import { UserRole } from "../../generated/prisma/client/enums";
import StatsController from "./stats.controller";


export default function registerStatsRoutes(): Router {
  const router = express.Router();
  const controller =  new StatsController();

 

  return router;
}
