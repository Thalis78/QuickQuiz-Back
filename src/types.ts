export interface Student {
  id: string;
  name: string;
  socketId: string;
  joinedAt: Date;
  answers: Map<number, string>; // questionIndex -> selectedAlternative
  score: number;
}

export interface QuizQuestion {
  id: string;
  enunciado: string;
  alternativas: {
    texto: string;
    correta: boolean;
  }[];
  tipo: 'texto' | 'imagem' | 'video' | 'mista';
}

export interface QuizConfig {
  nivel: string;
  categorias: {
    texto: boolean;
    imagem: boolean;
    video: boolean;
    misturado: boolean;
  };
  tempoPorQuestao: number;
  quantidadeQuestoes: number;
  titulo: string;
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
  professorSocketId: string;
  students: Map<string, Student>;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
  questionStartTime?: Date;
  questionTimer?: NodeJS.Timeout; // Timer automático da questão
  createdAt: Date;
}

export interface RoomManager {
  rooms: Map<string, Room>;
  createRoom(quiz: Quiz, professorSocketId: string): string;
  getRoom(code: string): Room | undefined;
  getRoomBySocketId(socketId: string): Room | undefined;
  addStudent(code: string, student: Omit<Student, 'id' | 'answers' | 'score'>): Student | null;
  removeStudent(code: string, studentId: string): void;
  startQuiz(code: string): boolean;
  nextQuestion(code: string): boolean;
  submitAnswer(code: string, studentId: string, questionIndex: number, answer: string): boolean;
  finishQuiz(code: string): void;
  closeRoom(code: string): void;
}
