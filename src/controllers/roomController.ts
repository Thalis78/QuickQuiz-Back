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

        return res.status(201).json({ sala_codigo: salaCodigo });
    } catch (error: any) {
        console.error("Erro ao criar sala:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao criar a sala." 
        });
    }
}

export const obterSala = async (req: Request, res: Response) => {
    try {
        const { codigo } = req.params;

        const sala = roomService.getRoom(codigo);

        if (!sala) {
            return res.status(404).json({ error: "Sala não encontrada." });
        }

        const { titulo, quantidadeQuestoes, tempoPorQuestao, nivel } = sala.quiz.config;
        const questoes = sala.quiz.questoes;
        const alunos = Array.from(sala.students.values()).map(student => ({
            nome: student.name,
            score: student.score
        }));

        const dadosSala = {
            titulo,
            quantidadeQuestoes,
            tempoPorQuestao,
            nivel,
            questoes,
            alunos
        };

        return res.status(200).json(dadosSala);
    } catch (error: any) {
        console.error("Erro ao obter sala:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao obter os dados da sala." 
        });
    }
}

export const adicionarAluno = async (req: Request, res: Response) => {
    try {
        const { codigo } = req.params;
        const { nome } = req.body;

        if (!nome || nome.trim() === "") {
            return res.status(400).json({ error: "O nome do aluno é obrigatório." });
        }

        const novoAluno = roomService.addStudent(codigo, { 
            name: nome.trim(), 
            joinedAt: new Date() 
        });

        if (!novoAluno) {
            return res.status(400).json({ 
                error: "Não foi possível entrar na sala. Verifique se o código está correto, se a sala já iniciou ou se o nome já está em uso." 
            });
        }

        const alunoFormatado = {
            id: novoAluno.id,
            nome: novoAluno.name,
            score: novoAluno.score,
            joinedAt: novoAluno.joinedAt
        };

        return res.status(201).json(alunoFormatado);
    } catch (error: any) {
        console.error("Erro ao adicionar aluno:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao adicionar o aluno à sala." 
        });
    }
}
