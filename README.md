# Guia Prático para Executar o Projeto 

## 1. Clonar o Repostitório
```
git clone https://github.com/Thalis78/QuickQuiz-Back.git
```
## 2. Instalar as Dependências
```
npm install 
```
## 3. Criar um Arquivo .env
Crie um arquivo e nomeie como ".env", depois adicione a seguinte configuração no arquivo:
```
# Configuração do Servidor
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (Base de Dados)
SUPABASE_URL=url_do_supabase
SUPABASE_ANON_KEY=anon_key_do_supabase

# Autenticação do Professor (Login fixo)
PROFESSOR_EMAIL=professor@ciel.com
PROFESSOR_PASSWORD=12345678
```
## 4. Executar o Projeto
```
npm run dev
```
