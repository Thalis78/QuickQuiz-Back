import { Room, Quiz, Student } from "../domain/entities/types";
import { v4 as uuidv4 } from 'uuid';

export class RoomService {
    rooms: Map<string, Room> = new Map();

    private generateRoomCode(): string {
        let code: string;

        do {
            code = Math.floor(1000 + Math.random() * 9000).toString();
        } while (this.rooms.has(code));

        return code;
  }

  createRoom(quiz: Quiz): string {
    const code = this.generateRoomCode();

    const room: Room = {
      id: uuidv4(),
      code,
      quiz,
      students: new Map(),
      status: 'waiting',
      currentQuestionIndex: -1,
      createdAt: new Date(),
    };

    this.rooms.set(code, room);

    console.log(`Sala ${code} criada com sucesso!`);
    return code;
  }

  getRoom(code: string): Room | undefined {
    console.log(`Sala ${code} obtida com sucesso!`)
    return this.rooms.get(code);
  }

  addStudent(code: string, student: Omit<Student, 'id' | 'score'>): Student | null {
    const room = this.rooms.get(code);

    if (!room) return null;

    if (room.status !== 'waiting') {
      console.log(`Tentativa de entrar na Sala ${code} que já iniciou.`);
      return null;
    }

    for (const existingStudent of room.students.values()) {
      if (existingStudent.name.toLowerCase() === student.name.toLowerCase()) {
        console.log(`Nome duplicado na Sala ${code}: ${student.name}`);
        return null;
      }
    }

    const newStudent: Student = {
      id: uuidv4(),
      ...student,
      score: 0,
    };

    room.students.set(newStudent.id, newStudent);
    console.log(`Aluno ${newStudent.name} adicionado com sucesso!`);
    return newStudent;
  }

  // removeStudent(code: string, studentId: string): void {
  //   const room = this.rooms.get(code);

  //   if (!room) return;

  //   const student = room.students.get(studentId);

  //   if (student) {
  //     room.students.delete(studentId);
  //     console.log(`Aluno ${student.name} saiu da sala ${code}`);
  //   }
  // }

  // startQuiz(code: string): boolean {
  //   const room = this.rooms.get(code);
    
  //   if (!room || room.status !== 'waiting') return false;

  //   room.status = 'playing';
  //   room.currentQuestionIndex = 0;
  //   room.questionStartTime = new Date();
  //   console.log(`Quiz iniciado na sala ${code}`);
  //   return true;
  // }

  // clearQuestionTimer(code: string): void {
  //   const room = this.rooms.get(code);

  //   if (room?.questionTimer) {
  //     clearTimeout(room.questionTimer);
  //     room.questionTimer = undefined;
  //   }
  // }

  // setQuestionTimer(code: string, timer: NodeJS.Timeout): void {
  //   const room = this.rooms.get(code);

  //   if (room) {
  //     // Limpa timer anterior se existir
  //     if (room.questionTimer) {
  //       clearTimeout(room.questionTimer);
  //     }
  //     room.questionTimer = timer;
  //   }
  // }

  // nextQuestion(code: string): boolean {
  //   const room = this.rooms.get(code);

  //   if (!room || room.status !== 'playing') return false;

  //   // Limpa timer da questão anterior
  //   this.clearQuestionTimer(code);

  //   if (room.currentQuestionIndex >= room.quiz.questoes.length - 1) {
  //     this.finishQuiz(code);
  //     return false;
  //   }

  //   room.currentQuestionIndex++;
  //   room.questionStartTime = new Date();
  //   console.log(`Sala ${code} - Questão ${room.currentQuestionIndex + 1}`);
  //   return true;
  // }

  // submitAnswer(code: string, studentId: string, questionIndex: number, answer: string): boolean {
  //   const room = this.rooms.get(code);

  //   if (!room || room.status !== 'playing') return false;

  //   const student = room.students.get(studentId);

  //   if (!student) return false;

  //   // Verifica se é a questão atual
  //   if (questionIndex !== room.currentQuestionIndex) {
  //     console.log(`Resposta fora de sincronia - Sala: ${code}, Aluno: ${student.name}`);
  //     return false;
  //   }

  //   // Verifica se está correta
  //   const question = room.quiz.questoes[questionIndex];
  //   const correctLetter = question.resposta.toLowerCase(); // A, B, C, D

  //   if (answer === correctLetter) {
  //     student.score += 1;
  //     console.log(`Resposta correta - ${student.name} na sala ${code}`);
  //   } else {
  //     console.log(`Resposta incorreta - ${student.name} na sala ${code}`);
  //   }

  //   return true;
  // }

  // finishQuiz(code: string): void {
  //   const room = this.rooms.get(code);

  //   if (!room) return;

  //   room.status = 'finished';
  //   console.log(`Quiz finalizado na sala ${code}`);
  // }

  // closeRoom(code: string): void {
  //   const room = this.rooms.get(code);
    
  //   if (room) {
  //     this.rooms.delete(code);
  //     console.log(`Sala ${code} fechada`);
  //   }
  // }
}

export const roomService = new RoomService();
