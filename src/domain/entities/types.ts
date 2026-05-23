export interface Student {
  id: string;
  name: string;
  score: number;
  joinedAt: Date;
}

export interface Alternatives {
    a: string;
    b: string;
    c: string;
    d: string;
}

export interface QuizQuestion {
  id: string;
  nivel: string;
  pergunta: string;
  alternativas: Alternatives;
  resposta: string;
  imagem: string | null;
}

export interface DataQuizQuestion {
  questoes_ingles: QuizQuestion[];
}

export interface QuizConfig {
  titulo: string;
  quantidadeQuestoes: number;
  tempoPorQuestao: number;
  nivel: string;
}

export interface Quiz {
  id: string;
  config: QuizConfig;
  questoes: QuizQuestion[];
  criadoEm: Date;
}

export interface Room {
  id: string;
  code: string;
  quiz: Quiz;
  students: Map<string, Student>;
  started: boolean;
  currentQuestionIndex: number;
  questionStartTime?: Date;
  questionTimer?: NodeJS.Timeout;
  createdAt: Date;
}
