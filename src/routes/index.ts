import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as authController from "../controllers/authController";
import * as roomController from "../controllers/roomController";

const router = Router();

router.post("/login", authController.loginProfessor);

router.post("/sala/criar", authMiddleware, roomController.criarSala);

router.get("/sala/:codigo", roomController.obterSala);

router.post("/sala/:codigo/aluno", roomController.adicionarAluno);

router.delete("/sala/:codigo/aluno/:alunoNome", roomController.removerAluno);

router.patch("/sala/:codigo/iniciar", authMiddleware, roomController.iniciarSala);

router.patch("/sala/:codigo/aluno/:alunoNome", roomController.atualizarPontuacao);

export default router;
