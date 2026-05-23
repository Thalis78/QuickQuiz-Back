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
      started: false,
      currentQuestionIndex: -1,
      createdAt: new Date(),
    };

    this.rooms.set(code, room);

    return code;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getStudentByName(code: string, studentName: string): Student | undefined {
    const room = this.rooms.get(code);

    if (!room) return;

    for (const student of room.students.values()) {
      if (student.name.toLowerCase() === studentName.toLowerCase()) {
          return student;
      }
    }
  }

  addStudent(code: string, student: Omit<Student, 'id' | 'score'>): Student | null {
    const room = this.rooms.get(code);

    if (!room) return null;

    if (room.started) {
      return null;
    }

    for (const existingStudent of room.students.values()) {
      if (existingStudent.name.toLowerCase() === student.name.toLowerCase()) {
        return null;
      }
    }

    const newStudent: Student = {
      id: uuidv4(),
      ...student,
      score: 0,
    };

    room.students.set(newStudent.id, newStudent);
    
    return newStudent;
  }

  removeStudent(code: string, studentId: string): void {
    const room = this.rooms.get(code);

    if (!room) return;

    const student = room.students.get(studentId);

    if (student) {
      room.students.delete(studentId);
    }
  }

  startQuiz(code: string): boolean {
    const room = this.rooms.get(code);
    
    if (!room || room.started) return false;

    room.started = true;
    room.currentQuestionIndex = 0;
    room.questionStartTime = new Date();

    return true;
  }

  scoreStudent(code: string, studentId: string, score: number): boolean {
    const room = this.rooms.get(code);
    
    if (!room || room.started) return false;

    const student = room.students.get(studentId);

    if (!student) {
      return false;
    }

    student.score += score;

    return true;
  }

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
