import { Request, Response, NextFunction } from 'express';

export const validateProfessor = (req: Request, res: Response, next: NextFunction) => {
    const professorEmail = req.body?.professorEmail || req.params?.professorEmail;
    const authorizedEmail = process.env.PROFESSOR_EMAIL;
    
    if (!professorEmail || professorEmail !== authorizedEmail) {
        return res.status(403).json({ error: 'Professor não autorizado' });
    }
    
    next();
};
