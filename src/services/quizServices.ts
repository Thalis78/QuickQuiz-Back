import { Quiz, QuizQuestion, QuizConfig, DataQuizQuestion } from '../domain/entities/types';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class QuizService {
    private readonly dbPath: string;
    quizzes: Map<string, Quiz> = new Map();

    constructor() {
        this.dbPath = path.resolve(__dirname, '../../database/db.json');
    }

    private carregarDados(): string {
        try {
            return fs.readFileSync(this.dbPath, 'utf-8');
        } catch (erro) {
            console.error(`Erro ao ler o arquivo db.json:`, erro);
            return JSON.stringify({ questoes_ingles: [] });
        }
    }

    private selecionarQuantidade(questoes: QuizQuestion[], quantidade: number): QuizQuestion[] {
        let questoesSelecionadas: QuizQuestion[] = [];

        for (let i = 0; i < quantidade; i++) {
            questoesSelecionadas.push(questoes[i]);
        }

        return questoesSelecionadas;
    }

    private shuffle(questoes: QuizQuestion[]): QuizQuestion[] {
        const copy = [...questoes];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    public getQuestoes(quantidade: number, nivel?: string, embaralhar: boolean = true): QuizQuestion[] {
        const jsonString = this.carregarDados();
        const dados: DataQuizQuestion = JSON.parse(jsonString);
        let questoes = dados.questoes_ingles;

        if (nivel) {
            questoes = questoes.filter(q => q.nivel === nivel);
        }

        if (embaralhar) {
            questoes = this.shuffle(questoes);
        }

        questoes = this.selecionarQuantidade(questoes, quantidade);

        return questoes;
    }

    public setQuizConfig(titulo: string, quantidadeQuestoes: number, tempoPorQuestao: number, nivel: string): QuizConfig {
        const config: QuizConfig = {
            titulo,
            quantidadeQuestoes,
            tempoPorQuestao,
            nivel,
        };

        return config;
    }

    public createQuiz(config: QuizConfig, questoes: QuizQuestion[]): Quiz {
        const quiz: Quiz = {
            id: uuidv4(),
            config,
            questoes,
            criadoEm: new Date(),
        }

        return quiz;
    }

}
