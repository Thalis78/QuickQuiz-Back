import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/login", authController.loginProfessor);

export default router;
