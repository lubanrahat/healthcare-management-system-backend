import express, { type Router } from "express";
import DoctorController from "./doctor.controller";




export default function registerDoctorRoutes(): Router {
    const router = express.Router();
    const controller = new DoctorController();

    router.get("/", controller.getAllDoctors.bind(controller));

  return router;
}
