// src/services/authServices.ts
import { supabase } from '../config/supabaseClient';
import jwt from 'jsonwebtoken';

export class AuthService {
    private readonly JWT_SECRET = "ciel_secret_key_2026_safe";

    async loginProfessor(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            throw new Error(error?.message || "Email ou senha incorretos");
        }

        const token = jwt.sign({ email: data.user.email, type: "professor" }, this.JWT_SECRET, { 
            expiresIn: "2h" 
        });

        console.log("Login realizado com sucesso!");
        return {
            success: true,
            token,
        };
    }
}
