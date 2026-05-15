import { Request, Response } from "express";
import { AuthService } from "../services/authServices";

const authService = new AuthService();

export const loginProfessor = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const login = await authService.loginProfessor(email, password);
    
    return res.json(login);
  } catch (err: any) {
    console.log("Erro no processo de login:", err.message);
    return res.status(401).json({ success: false, error: "Email ou senha incorretos" });
  }
};
