import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as authController from "../controllers/authController";
import * as roomController from "../controllers/roomController";

const router = Router();

router.post("/login", authController.loginProfessor);

router.post("/sala/criar", authMiddleware, roomController.criarSala);

export default router;
