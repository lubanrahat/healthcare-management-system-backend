import express, { type Router } from "express";
import UserController from "./user.controller";



export default function registerDoctorRoutes(): Router {
    const router = express.Router();
    const controller = new UserController();

    router.post("/create-doctor", controller.createDoctor.bind(controller));

  return router;
}
