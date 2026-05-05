import { Router } from 'express';
import * as authController from '../controllers/authController';
// import { validateProfessor } from '../middlewares/authMiddleware';

const router = Router();

// Rota de login
router.post('/auth/validate', authController.loginProfessor);

export default router;
