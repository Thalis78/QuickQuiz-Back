import * as fs from 'fs';
import * as path from 'path';
import { QuizQuestion, DataQuizQuestion } from '../domain/entities/types';

export class QuizService {
    private readonly dbPath: string;

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

    public getQuestoes(nivel?: string, embaralhar: boolean = true): QuizQuestion[] {
        const jsonString = this.carregarDados();
        const dados: DataQuizQuestion = JSON.parse(jsonString);
        let questoes = dados.questoes_ingles;

        if (nivel) {
            questoes = questoes.filter(q => q.nivel === nivel);
        }

        if (embaralhar) {
            questoes = this.shuffle(questoes);
        }

        return questoes;
    }

    private shuffle(questoes: QuizQuestion[]): QuizQuestion[] {
        const copy = [...questoes];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
}
