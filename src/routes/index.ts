import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as authController from "../controllers/authController";
import * as roomController from "../controllers/roomController";

const router = Router();

router.post("/login", authController.loginProfessor);

router.post("/sala/criar", authMiddleware, roomController.criarSala);

router.get("/sala/:codigo", authMiddleware, roomController.obterSala);

router.post("/sala/:codigo/aluno", roomController.adicionarAluno);

export default router;
