import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "ciel_secret_key_2026_safe";

export const loginProfessor = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const correctEmail = process.env.PROFESSOR_EMAIL;
  const correctPassword = process.env.PROFESSOR_PASSWORD;

  if (email === correctEmail && password === correctPassword) {
    const token = jwt.sign({ email, type: "professor" }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.json({
      success: true,
      token,
    });
  }

  res.status(401).json({ success: false, error: "Email ou senha incorretos" });
};
