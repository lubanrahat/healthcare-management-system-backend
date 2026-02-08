import express, { type Router } from "express";
import SpecialtyController from "./specialty.controller";

export default function registerSpecialtyRoutes(): Router {
  const router = express.Router();
  const controller = new SpecialtyController();

  router.post("/", controller.createSpecialty.bind(controller));

  return router;
}
