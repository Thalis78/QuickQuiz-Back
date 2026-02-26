import { Room, RoomManager, Student, Quiz } from './types';
import { v4 as uuidv4 } from 'uuid';

class RoomManagerImpl implements RoomManager {
  rooms: Map<string, Room> = new Map();

  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(quiz: Quiz, professorSocketId: string): string {
    const code = this.generateRoomCode();
    const room: Room = {
      id: uuidv4(),
      code,
      quiz,
      professorSocketId,
      students: new Map(),
      status: 'waiting',
      currentQuestionIndex: -1,
      createdAt: new Date(),
    };

    this.rooms.set(code, room);
    console.log(`✅ Sala criada: ${code} pelo professor ${professorSocketId}`);
    return code;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.professorSocketId === socketId) {
        return room;
      }
      for (const student of room.students.values()) {
        if (student.socketId === socketId) {
          return room;
        }
      }
    }
    return undefined;
  }

  addStudent(code: string, student: Omit<Student, 'id' | 'answers' | 'score'>): Student | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    if (room.status !== 'waiting') {
      console.log(`❌ Tentativa de entrar em sala que já iniciou: ${code}`);
      return null;
    }

    // Verifica se nome já existe
    for (const existingStudent of room.students.values()) {
      if (existingStudent.name.toLowerCase() === student.name.toLowerCase()) {
        console.log(`❌ Nome duplicado na sala ${code}: ${student.name}`);
        return null;
      }
    }

    const newStudent: Student = {
      id: uuidv4(),
      ...student,
      answers: new Map(),
      score: 0,
    };

    room.students.set(newStudent.id, newStudent);
    console.log(`✅ Aluno ${newStudent.name} entrou na sala ${code}`);
    return newStudent;
  }

  removeStudent(code: string, studentId: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    const student = room.students.get(studentId);
    if (student) {
      room.students.delete(studentId);
      console.log(`👋 Aluno ${student.name} saiu da sala ${code}`);
    }
  }

  startQuiz(code: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'waiting') return false;

    room.status = 'playing';
    room.currentQuestionIndex = 0;
    room.questionStartTime = new Date();
    console.log(`🚀 Quiz iniciado na sala ${code}`);
    return true;
  }

  clearQuestionTimer(code: string): void {
    const room = this.rooms.get(code);
    if (room?.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = undefined;
    }
  }

  setQuestionTimer(code: string, timer: NodeJS.Timeout): void {
    const room = this.rooms.get(code);
    if (room) {
      // Limpa timer anterior se existir
      if (room.questionTimer) {
        clearTimeout(room.questionTimer);
      }
      room.questionTimer = timer;
    }
  }

  nextQuestion(code: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'playing') return false;

    // Limpa timer da questão anterior
    this.clearQuestionTimer(code);

    if (room.currentQuestionIndex >= room.quiz.questoes.length - 1) {
      this.finishQuiz(code);
      return false;
    }

    room.currentQuestionIndex++;
    room.questionStartTime = new Date();
    console.log(`➡️ Sala ${code} - Questão ${room.currentQuestionIndex + 1}`);
    return true;
  }

  submitAnswer(code: string, studentId: string, questionIndex: number, answer: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'playing') return false;

    const student = room.students.get(studentId);
    if (!student) return false;

    // Verifica se é a questão atual
    if (questionIndex !== room.currentQuestionIndex) {
      console.log(`❌ Resposta fora de sincronia - Sala: ${code}, Aluno: ${student.name}`);
      return false;
    }

    // Salva resposta
    student.answers.set(questionIndex, answer);

    // Verifica se está correta
    const question = room.quiz.questoes[questionIndex];
    const correctIndex = question.alternativas.findIndex(alt => alt.correta);
    const correctLetter = String.fromCharCode(65 + correctIndex); // A, B, C, D

    if (answer === correctLetter) {
      student.score += 1;
      console.log(`✅ Resposta correta - ${student.name} na sala ${code}`);
    } else {
      console.log(`❌ Resposta incorreta - ${student.name} na sala ${code}`);
    }

    return true;
  }

  finishQuiz(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.status = 'finished';
    console.log(`🏁 Quiz finalizado na sala ${code}`);
  }

  closeRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      this.rooms.delete(code);
      console.log(`🔒 Sala ${code} fechada`);
    }
  }
}

export const roomManager = new RoomManagerImpl();
