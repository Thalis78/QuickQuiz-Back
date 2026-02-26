import { Router } from 'express';
import { supabase } from './supabaseClient';

const router = Router();

// Middleware para validar professor autorizado
const validateProfessor = (req: any, res: any, next: any) => {
  const professorEmail = req.body?.professorEmail || req.params?.professorEmail;
  const authorizedEmail = process.env.PROFESSOR_EMAIL;
  
  if (!professorEmail || professorEmail !== authorizedEmail) {
    return res.status(403).json({ error: 'Professor não autorizado' });
  }
  
  next();
};

// Validar login de professor
router.post('/auth/validate', (req, res) => {
  const { email, password } = req.body;
  const correctEmail = process.env.PROFESSOR_EMAIL;
  const correctPassword = process.env.PROFESSOR_PASSWORD;
  
  // Validar email E senha
  if (email === correctEmail && password === correctPassword) {
    return res.json({ 
      success: true,
      professor: {
        id: email.split('@')[0],
        email,
        name: 'Professor CIEL',
        type: 'professor'
      }
    });
  }
  
  res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
});

// Salvar um quiz
router.post('/quizzes', validateProfessor, async (req, res) => {
  try {
    const { id, professorEmail, title, config, questions } = req.body;

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        id,
        professor_email: professorEmail,
        title,
        config,
        questions,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar quiz:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Quiz salvo no Supabase:', data.id);
    res.json(data);
  } catch (err) {
    console.error('❌ Erro ao salvar quiz:', err);
    res.status(500).json({ error: 'Erro ao salvar quiz' });
  }
});

// Carregar quizzes de um professor
router.get('/quizzes/:professorEmail', validateProfessor, async (req, res) => {
  try {
    const { professorEmail } = req.params;

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('professor_email', professorEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao carregar quizzes:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ ${data.length} quizzes carregados para ${professorEmail}`);
    res.json(data);
  } catch (err) {
    console.error('❌ Erro ao carregar quizzes:', err);
    res.status(500).json({ error: 'Erro ao carregar quizzes' });
  }
});

// Deletar um quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar quiz:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Quiz deletado:', id);
    res.json({ message: 'Quiz deletado com sucesso' });
  } catch (err) {
    console.error('❌ Erro ao deletar quiz:', err);
    res.status(500).json({ error: 'Erro ao deletar quiz' });
  }
});

export default router;
