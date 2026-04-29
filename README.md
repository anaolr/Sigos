# 🛡️ SIGOS - Sistema Integrado de Gestão de Ocorrências

> **Status do Projeto:** 🚀 Em Produção (Hospedado na Nuvem)

O **SIGOS** é uma solução digital Full Stack criada para modernizar o registo e a monitorização de problemas técnicos e operacionais. O sistema substitui processos manuais por um fluxo automatizado que conecta Funcionários, Gestores e Administradores numa plataforma única e segura.

---

## 🌐 Arquitetura de Nuvem (Onde o sistema "vive")

Para garantir que o sistema estivesse acessível em qualquer lugar, utilizei uma infraestrutura dividida em duas camadas:

1.  **Interface (Frontend - Vercel):** O "rosto" do sistema. Hospedado na **Vercel**, focado em performance e rapidez no carregamento das páginas.
2.  **Servidor e Memória (Backend & Base de Dados - Railway):** O "cérebro" do sistema. Hospedado no **Railway**, onde a lógica de negócio é processada e os dados são guardados de forma persistente num banco de dados **MySQL**.



---

## 🛠️ Tecnologias e Conceitos (O que há "por baixo do capô")

Aqui estão as tecnologias explicadas de forma simples para facilitar o entendimento do projeto:

* **Node.js & Express:** O motor do servidor. Responsável por receber os pedidos dos utilizadores e enviar as respostas certas.
* **MySQL & Sequelize:** O **MySQL** é onde os dados são organizados em tabelas. O **Sequelize** funciona como um "tradutor" (ORM), permitindo manipular a base de dados usando apenas JavaScript.
* **JWT (JSON Web Token):** Funciona como um "passe digital". Após o login, o utilizador recebe este token para navegar nas áreas restritas sem precisar de colocar a senha repetidamente.
* **Bcrypt:** Sistema de segurança que encripta as senhas. Elas são transformadas em códigos complexos antes de serem guardadas, garantindo que a senha real nunca fique exposta.
* **Nodemailer:** O serviço de envio de mensagens do sistema, utilizado para o fluxo de recuperação de acesso.



---

## 🔑 Funcionalidades Principais

### 1. Níveis de Acesso Dinâmicos
O sistema adapta-se automaticamente ao perfil de quem faz o login:
* **Funcionários:** Criam ocorrências e acompanham os seus estados.
* **Gestores:** Monitorizam e gerem as ocorrências dos seus setores específicos.
* **Administradores:** Têm controlo total sobre utilizadores, métricas e configurações globais.

### 2. Recuperação de Acesso via Logs de Servidor
Devido a restrições de segurança em servidores de nuvem gratuitos para e-mails (SMTP), implementámos uma solução técnica de **Observabilidade**: o link de recuperação é gerado de forma segura e exibido nos **logs do servidor**. Isto permite que o fluxo de segurança seja validado e testado em tempo real durante a apresentação.

---

## 🚀 Como Explorar o Projeto

1.  **Aceda ao link oficial:** [https://sigos-wheat.vercel.app](https://sigos-wheat.vercel.app)
2.  **Teste os Perfis:** Pode entrar como Administrador ou criar um novo registo de Funcionário.
3.  **Dashboards:** Explore os gráficos que são alimentados automaticamente a cada nova ocorrência registada na base de dados.

---

## 📄 Guia de Instalação (Para Desenvolvedores)

Se desejar rodar o projeto localmente, configure as variáveis de ambiente num ficheiro `.env`:

```env
DB_HOST=seu_host_do_railway
DB_USER=seu_usuario
DB_PASS=sua_senha
JWT_SECRET=sua_chave_mestra
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
