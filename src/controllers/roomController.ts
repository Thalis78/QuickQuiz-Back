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

        console.log(`Sala ${salaCodigo} criada com sucesso!`);
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
            console.log(`Sala ${codigo} não encontrada.`)
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

        console.log(`Sala ${codigo} obtida com sucesso!`)
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
            console.log(`O nome do Aluno é obrigatório.`)
            return res.status(400).json({ error: "O nome do aluno é obrigatório." });
        }

        const novoAluno = roomService.addStudent(codigo, { 
            name: nome.trim(), 
            joinedAt: new Date() 
        });

        if (!novoAluno) {
            console.log(`Não foi possível adicionar o Aluno ${nome}.`);
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

        console.log(`Aluno ${nome} adicionado com sucesso!`);
        return res.status(201).json(alunoFormatado);
    } catch (error: any) {
        console.error("Erro ao adicionar aluno:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao adicionar o aluno à sala." 
        });
    }
}

export const removerAluno = async (req: Request, res: Response) => {
    try {
        const { codigo, alunoNome } = req.params;

        const sala = roomService.getRoom(codigo);
        
        if (!sala) {
            console.log(`Sala ${codigo} não encontrada.`);
            return res.status(404).json({ error: "Sala não encontrada." });
        }

        let alunoIdParaRemover: string | null = null;

        for (const [id, student] of sala.students.entries()) {
            if (student.name.toLowerCase() === alunoNome.toLowerCase()) {
                alunoIdParaRemover = id;
                break;
            }
        }

        if (!alunoIdParaRemover) {
            console.log(`Aluno ${alunoNome} não encontrado na Sala ${codigo}.`);
            return res.status(404).json({ error: "Aluno não encontrado nesta Sala." });
        }

        roomService.removeStudent(codigo, alunoIdParaRemover);

        console.log(`Aluno ${alunoNome} saiu da Sala ${codigo}`);
        return res.status(200).json({ 
            success: true, 
            message: `Aluno ${alunoNome} removido com sucesso.` 
        });
    } catch (error: any) {
        console.error("Erro ao remover Aluno:", error.message);
        return res.status(500).json({ 
            error: "Erro interno ao tentar remover o Aluno." 
        });
    }
}
