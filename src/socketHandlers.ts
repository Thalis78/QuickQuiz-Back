import { Server, Socket } from 'socket.io';
import { roomManager } from './roomManager';
import { Quiz } from './types';

export function setupSocketHandlers(io: Server) {
  // Função helper para agendar avanço automático
  const scheduleNextQuestion = (code: string, timeLimit: number) => {
    console.log(`⏰ Timer configurado: ${timeLimit}s para sala ${code}`);
    
    const autoAdvanceTimer = setTimeout(() => {
      // Busca sala atualizada dentro do timeout
      const room = roomManager.getRoom(code);
      if (!room) {
        console.log(`⚠️ Sala ${code} não existe mais`);
        return;
      }

      console.log(`⏰ Tempo esgotado (${timeLimit}s) - avançando automaticamente sala ${code}`);
      const hasNext = roomManager.nextQuestion(code);
      
      if (hasNext) {
        // Busca sala novamente após nextQuestion para pegar índice atualizado
        const updatedRoom = roomManager.getRoom(code);
        if (!updatedRoom) return;
        
        const nextQuestion = updatedRoom.quiz.questoes[updatedRoom.currentQuestionIndex];
        io.to(`room-${code}`).emit('next-question', {
          questionIndex: updatedRoom.currentQuestionIndex,
          question: {
            enunciado: nextQuestion.enunciado,
            alternativas: nextQuestion.alternativas.map(alt => ({ texto: alt.texto })),
          },
          timeLimit: updatedRoom.quiz.config.tempoPorQuestao,
        });
        
        // Agenda próximo avanço com tempo correto
        scheduleNextQuestion(code, updatedRoom.quiz.config.tempoPorQuestao);
      } else {
        // Quiz finalizado - busca sala uma última vez
        const finalRoom = roomManager.getRoom(code);
        if (!finalRoom) return;
        
        const results = Array.from(finalRoom.students.values()).map(student => ({
          id: student.id,
          name: student.name,
          score: student.score,
          totalQuestions: finalRoom.quiz.questoes.length,
        })).sort((a, b) => b.score - a.score);

        io.to(`room-${code}`).emit('quiz-finished', { results });
        console.log(`🏁 Quiz finalizado automaticamente na sala ${code}`);
      }
    }, timeLimit * 1000);
    
    roomManager.setQuestionTimer(code, autoAdvanceTimer);
  };

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // Professor cria sala
    socket.on('create-room', (quiz: Quiz, callback) => {
      try {
        const code = roomManager.createRoom(quiz, socket.id);
        socket.join(`room-${code}`);
        
        callback({ success: true, code });
      } catch (error) {
        console.error('❌ Erro ao criar sala:', error);
        callback({ success: false, error: 'Erro ao criar sala' });
      }
    });

    // Aluno entra na sala
    socket.on('join-room', (data: { code: string; name: string }, callback) => {
      try {
        const { code, name } = data;
        const room = roomManager.getRoom(code);

        if (!room) {
          callback({ success: false, error: 'Sala não encontrada' });
          return;
        }

        if (room.status !== 'waiting') {
          callback({ success: false, error: 'Quiz já iniciado' });
          return;
        }

        const student = roomManager.addStudent(code, {
          name,
          socketId: socket.id,
          joinedAt: new Date(),
        });

        if (!student) {
          callback({ success: false, error: 'Nome já em uso' });
          return;
        }

        socket.join(`room-${code}`);
        
        // Notifica professor e outros alunos
        io.to(`room-${code}`).emit('student-joined', {
          student: {
            id: student.id,
            name: student.name,
            joinedAt: student.joinedAt,
          },
          totalStudents: room.students.size,
        });

        // Envia lista completa de alunos para quem acabou de entrar
        const studentsList = Array.from(room.students.values()).map(s => ({
          id: s.id,
          name: s.name,
          joinedAt: s.joinedAt,
        }));

        callback({ 
          success: true, 
          studentId: student.id,
          quiz: {
            config: room.quiz.config,
            questoes: room.quiz.questoes.map(q => ({
              enunciado: q.enunciado,
              // Não envia alternativas corretas para o cliente
            })),
          },
          totalQuestions: room.quiz.questoes.length,
          students: studentsList,
        });
      } catch (error) {
        console.error('❌ Erro ao entrar na sala:', error);
        callback({ success: false, error: 'Erro ao entrar na sala' });
      }
    });

    // Aluno sai da sala
    socket.on('leave-room', (data: { code: string; studentId: string }) => {
      try {
        const { code, studentId } = data;
        const room = roomManager.getRoom(code);
        
        if (room) {
          const student = room.students.get(studentId);
          roomManager.removeStudent(code, studentId);
          socket.leave(`room-${code}`);
          
          io.to(`room-${code}`).emit('student-left', {
            studentId,
            studentName: student?.name,
            totalStudents: room.students.size,
          });
          
          console.log(`👋 Aluno ${studentId} saiu da sala ${code}`);
        }
      } catch (error) {
        console.error('❌ Erro ao sair da sala:', error);
      }
    });

    // Professor inicia quiz
    socket.on('start-quiz', (code: string, callback) => {
      try {
        const room = roomManager.getRoom(code);
        
        if (!room) {
          callback({ success: false, error: 'Sala não encontrada' });
          return;
        }

        if (room.professorSocketId !== socket.id) {
          callback({ success: false, error: 'Apenas o professor pode iniciar' });
          return;
        }

        if (room.students.size === 0) {
          callback({ success: false, error: 'Nenhum aluno conectado' });
          return;
        }

        // Verifica se já está jogando (proteção contra duplo clique)
        if (room.status === 'playing') {
          console.log(`⚠️ Quiz já iniciado na sala ${code} - ignorando chamada duplicada`);
          callback({ success: false, error: 'Quiz já iniciado' });
          return;
        }

        const started = roomManager.startQuiz(code);
        
        if (started) {
          // Envia primeira questão para todos
          const question = room.quiz.questoes[0];
          const timeLimit = room.quiz.config.tempoPorQuestao;
          
          io.to(`room-${code}`).emit('quiz-started', {
            questionIndex: 0,
            question: {
              enunciado: question.enunciado,
              alternativas: question.alternativas.map(alt => ({ texto: alt.texto })),
            },
            timeLimit: timeLimit,
            totalQuestions: room.quiz.questoes.length,
          });

          // Agenda avanço automático usando função helper
          scheduleNextQuestion(code, timeLimit);

          callback({ success: true });
          console.log(`🚀 Quiz iniciado na sala ${code} - Tempo por questão: ${timeLimit}s`);
        } else {
          callback({ success: false, error: 'Erro ao iniciar quiz' });
        }
      } catch (error) {
        console.error('❌ Erro ao iniciar quiz:', error);
        callback({ success: false, error: 'Erro ao iniciar quiz' });
      }
    });

    // Aluno submete resposta
    socket.on('submit-answer', (data: { code: string; studentId: string; questionIndex: number; answer: string }, callback) => {
      try {
        const { code, studentId, questionIndex, answer } = data;
        const success = roomManager.submitAnswer(code, studentId, questionIndex, answer);
        
        const room = roomManager.getRoom(code);
        if (room) {
          const student = room.students.get(studentId);
          
          // Notifica professor sobre resposta recebida
          io.to(room.professorSocketId).emit('student-answered', {
            studentId,
            studentName: student?.name,
            questionIndex,
          });
        }

        callback({ success });
      } catch (error) {
        console.error('❌ Erro ao submeter resposta:', error);
        callback({ success: false });
      }
    });

    // Professor avança para próxima questão (manual)
    socket.on('next-question', (code: string, callback) => {
      try {
        const room = roomManager.getRoom(code);
        
        if (!room || room.professorSocketId !== socket.id) {
          callback({ success: false, error: 'Não autorizado' });
          return;
        }

        const hasNext = roomManager.nextQuestion(code);
        
        if (hasNext) {
          // Busca sala atualizada após nextQuestion
          const updatedRoom = roomManager.getRoom(code);
          if (!updatedRoom) {
            callback({ success: false, error: 'Sala não encontrada' });
            return;
          }
          
          const question = updatedRoom.quiz.questoes[updatedRoom.currentQuestionIndex];
          const timeLimit = updatedRoom.quiz.config.tempoPorQuestao;
          
          io.to(`room-${code}`).emit('next-question', {
            questionIndex: updatedRoom.currentQuestionIndex,
            question: {
              enunciado: question.enunciado,
              alternativas: question.alternativas.map(alt => ({ texto: alt.texto })),
            },
            timeLimit: timeLimit,
          });

          // Agenda próximo avanço automático
          scheduleNextQuestion(code, timeLimit);

          callback({ success: true });
          console.log(`⏭️ Professor avançou manualmente - Sala ${code} - Quest\u00e3o ${updatedRoom.currentQuestionIndex + 1}`);
        } else {
          // Quiz finalizado
          const results = Array.from(room.students.values()).map(student => ({
            id: student.id,
            name: student.name,
            score: student.score,
            totalQuestions: room.quiz.questoes.length,
          })).sort((a, b) => b.score - a.score);

          io.to(`room-${code}`).emit('quiz-finished', { results });
          callback({ success: true, finished: true });
          console.log(`🏁 Quiz finalizado na sala ${code}`);
        }
      } catch (error) {
        console.error('❌ Erro ao avançar questão:', error);
        callback({ success: false, error: 'Erro ao avançar questão' });
      }
    });

    // Professor fecha sala
    socket.on('close-room', (code: string) => {
      try {
        const room = roomManager.getRoom(code);
        
        if (room && room.professorSocketId === socket.id) {
          // Limpa timer antes de fechar
          roomManager.clearQuestionTimer(code);
          io.to(`room-${code}`).emit('room-closed');
          roomManager.closeRoom(code);
          console.log(`🔒 Sala ${code} fechada`);
        }
      } catch (error) {
        console.error('❌ Erro ao fechar sala:', error);
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      const room = roomManager.getRoomBySocketId(socket.id);
      
      if (room) {
        // Se for professor, fecha a sala
        if (room.professorSocketId === socket.id) {
          // Limpa timer antes de fechar
          roomManager.clearQuestionTimer(room.code);
          io.to(`room-${room.code}`).emit('room-closed');
          roomManager.closeRoom(room.code);
          console.log(`🔒 Sala ${room.code} fechada (professor desconectou)`);
        } else {
          // Se for aluno, remove da sala
          for (const [studentId, student] of room.students.entries()) {
            if (student.socketId === socket.id) {
              roomManager.removeStudent(room.code, studentId);
              io.to(`room-${room.code}`).emit('student-left', {
                studentId,
                studentName: student.name,
                totalStudents: room.students.size,
              });
              break;
            }
          }
        }
      }
      
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });
}
