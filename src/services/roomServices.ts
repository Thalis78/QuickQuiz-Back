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

  cleanRooms(): void {
    this.rooms.clear();
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
    
    if (!room || !room.started) return false;

    const student = room.students.get(studentId);

    if (!student) {
      return false;
    }

    student.score += score;

    return true;
  }
}

export const roomService = new RoomService();
