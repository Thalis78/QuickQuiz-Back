import { Request, Response } from "express";
import { RoomService } from "../services/roomServices";
import { QuizService } from "../services/quizServices";

const roomService = new RoomService();
const quizService = new QuizService();

export const criarSala = async (req: Request, res: Response) => {
  try {
    const { titulo, quantidade, tempo, nivel } = req.body;

    const quizQuestoes = quizService.getQuestoes(quantidade, nivel);
    const quizConfig = quizService.setQuizConfig(
      titulo,
      quantidade,
      tempo,
      nivel,
    );

    roomService.cleanRooms();

    const quiz = quizService.createQuiz(quizConfig, quizQuestoes);
    const salaCodigo = roomService.createRoom(quiz);

    console.log(`Sala ${salaCodigo} criada com sucesso!`);
    return res.status(201).json({ sala_codigo: salaCodigo });
  } catch (error: any) {
    console.error("Erro ao criar sala:", error.message);
    return res.status(500).json({
      error: "Erro interno ao criar a sala.",
    });
  }
};

export const obterSala = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const sala = roomService.getRoom(codigo);

    if (!sala) {
      console.log(`Sala ${codigo} não encontrada.`);
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    const { titulo, quantidadeQuestoes, tempoPorQuestao, nivel } =
      sala.quiz.config;
    const questoes = sala.quiz.questoes;
    const alunos = Array.from(sala.students.values()).map((student) => ({
      nome: student.name,
      score: student.score,
    }));

    const dadosSala = {
      codigo,
      titulo,
      quantidadeQuestoes,
      tempoPorQuestao,
      nivel,
      questoes,
      alunos,
      started: sala.started,
      currentQuestionIndex: sala.currentQuestionIndex,
    };

    console.log(`Sala ${codigo} obtida com sucesso!`);
    return res.status(200).json(dadosSala);
  } catch (error: any) {
    console.error("Erro ao obter sala:", error.message);
    return res.status(500).json({
      error: "Erro interno ao obter os dados da sala.",
    });
  }
};

export const adicionarAluno = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim() === "") {
      console.log(`O nome do Aluno é obrigatório.`);
      return res.status(400).json({ error: "O nome do aluno é obrigatório." });
    }

    const novoAluno = roomService.addStudent(codigo, {
      name: nome.trim(),
      joinedAt: new Date(),
    });

    if (!novoAluno) {
      console.log(`Não foi possível adicionar o Aluno ${nome}.`);
      return res.status(400).json({
        error:
          "Não foi possível entrar na sala. Verifique se o código está correto, se a sala já iniciou ou se o nome já está em uso.",
      });
    }

    const alunoFormatado = {
      id: novoAluno.id,
      nome: novoAluno.name,
      score: novoAluno.score,
      joinedAt: novoAluno.joinedAt,
    };

    console.log(`Aluno ${nome} adicionado com sucesso!`);
    return res.status(201).json(alunoFormatado);
  } catch (error: any) {
    console.error("Erro ao adicionar aluno:", error.message);
    return res.status(500).json({
      error: "Erro interno ao adicionar o aluno à sala.",
    });
  }
};

export const removerAluno = async (req: Request, res: Response) => {
  try {
    const { codigo, alunoNome } = req.params;

    const sala = roomService.getRoom(codigo);

    if (!sala) {
      console.log(`Sala ${codigo} não encontrada.`);
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    const aluno = roomService.getStudentByName(codigo, alunoNome);

    if (!aluno) {
      console.log(`Aluno ${codigo} não encontrado na Sala ${codigo}.`);
      return res
        .status(404)
        .json({ error: "Aluno não encontrado nesta Sala." });
    }

    roomService.removeStudent(codigo, aluno.id);

    console.log(`Aluno ${alunoNome} saiu da Sala ${codigo}`);
    return res.status(200).json({
      success: true,
      message: `Aluno ${alunoNome} removido com sucesso.`,
    });
  } catch (error: any) {
    console.error("Erro ao remover Aluno:", error.message);
    return res.status(500).json({
      error: "Erro interno ao tentar remover o Aluno.",
    });
  }
};

export const iniciarSala = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const salaIniciada = roomService.startQuiz(codigo);

    if (!salaIniciada) {
      console.log(`Não foi possível iniciar a Sala ${codigo}.`);
      return res.status(400).json({
        error:
          "Não foi possível iniciar a sala. Verifique se o código está correto ou se ela já foi iniciada.",
      });
    }

    console.log(`Sala ${codigo} iniciada com sucesso!`);
    return res.status(200).json({
      success: true,
      message: "Sala iniciada com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao remover Aluno:", error.message);
    return res.status(500).json({
      error: "Erro interno ao tentar remover o Aluno.",
    });
  }
};

export const atualizarPontuacao = async (req: Request, res: Response) => {
  try {
    const { codigo, alunoNome } = req.params;
    const { pontuacao } = req.body;

    if (pontuacao === undefined || typeof pontuacao !== "number") {
      console.log("Pontuação inválida.");
      return res.status(400).json({
        error:
          "O novo valor de 'pontuacao' é obrigatório e deve ser um número.",
      });
    }

    const sala = roomService.getRoom(codigo);

    if (!sala) {
      console.log(`Sala ${codigo} não encontrada.`);
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    const aluno = roomService.getStudentByName(codigo, alunoNome);

    if (!aluno) {
      console.log(`Aluno ${codigo} não encontrado na Sala ${codigo}.`);
      return res
        .status(404)
        .json({ error: "Aluno não encontrado nesta Sala." });
    }

    const alunoPontuado = roomService.scoreStudent(codigo, aluno.id, pontuacao);

    if (!alunoPontuado) {
      console.log(
        `Não foi possível atualizar a pontuação do Aluno ${alunoNome}.`,
      );
      return res.status(400).json({
        error:
          "Não foi possível atualizar a pontuação do aluno. Verifique se o nome está correto ou se a sala foi iniciada.",
      });
    }

    console.log(
      `A pontuação do Aluno ${alunoNome} foi atualizada com sucesso!`,
    );
    return res.status(200).json({
      success: true,
      message: "Pontuação atualizada com sucesso.",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar pontuação do estudante:", error.message);
    return res.status(500).json({
      error: "Erro interno ao tentar atualizar a pontuação.",
    });
  }
};
