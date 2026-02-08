import express, { type Router } from "express";
import HealthController from "./health.controller";

export default function registerHealthRoutes(): Router {
  const router = express.Router();
  const controller = new HealthController();

  router.get("/", controller.handleHealthCheck.bind(controller));

  return router;
}