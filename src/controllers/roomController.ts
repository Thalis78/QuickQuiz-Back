import { Request, Response } from "express";
import { RoomService } from "../services/roomServices"; 
import { QuizService } from "../services/quizServices";

const roomService = new RoomService();
const quizService = new QuizService();

export const criarSala = async (req: Request, res: Response) => {
    try {
        const { titulo, quantidade, tempo, nivel } = req.body;

        const quizQuestoes = quizService.getQuestoes(quantidade, nivel);
        const quizConfig = quizService.setQuizConfig(titulo, quantidade, tempo, nivel);
        const quiz = quizService.createQuiz(quizConfig, quizQuestoes);
        const salaCodigo = roomService.createRoom(quiz);

        console.log("Sala criada com sucesso!");
        return res.status(201).json({ sala_codigo: salaCodigo });
    } catch (error: any) {
        console.error("Erro ao criar sala:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao criar a sala." 
        });
    }
}
