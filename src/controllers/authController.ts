import { Request, Response } from 'express';

export const loginProfessor = (req: Request, res: Response) => {
    const { email, password } = req.body;
    const correctEmail = process.env.PROFESSOR_EMAIL;
    const correctPassword = process.env.PROFESSOR_PASSWORD;
    
    if (email === correctEmail && password === correctPassword) {
        return res.json({ 
            success: true,
            professor: {
                id: email.split('@')[0],
                email,
                name: 'Professor CIEL',
                type: 'professor'
            }
        });
    }
    
    res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
};
