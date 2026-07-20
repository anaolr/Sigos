
# 🛡️ SIGOS — Sistema Integrado de Gestão de Ocorrências e Sugestões

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Status](https://img.shields.io/badge/Status-Concluído-2ECC71)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Railway-181717?logo=vercel)

Sistema web **full stack** desenvolvido como **Projeto Integrador** do curso Técnico em Desenvolvimento de Sistemas.

O SIGOS foi criado para centralizar o gerenciamento de ocorrências e sugestões em ambientes organizacionais, permitindo que funcionários registrem solicitações e acompanhem seu andamento, enquanto gestores e administradores realizam o gerenciamento por meio de diferentes níveis de acesso.

🌐 **Deploy:**  
https://sigos-wheat.vercel.app

---

# Funcionalidades

- Cadastro e autenticação de usuários
- Login utilizando autenticação JWT
- Controle de acesso baseado em perfis (Funcionário, Gestor e Administrador)
- Cadastro de ocorrências e sugestões
- Edição e atualização de ocorrências
- Acompanhamento do status das solicitações
- Dashboard com métricas atualizadas automaticamente
- Recuperação de senha
- Criptografia de senhas utilizando Bcrypt
- Persistência de dados em banco MySQL
- Deploy completo utilizando Vercel e Railway

---

# Arquitetura da Aplicação

O sistema foi dividido em duas camadas principais:

```text
Frontend (HTML • CSS • JavaScript)

            │

            ▼

API REST (Node.js + Express)

            │

            ▼

MySQL (Sequelize ORM)

            │

            ▼

Railway
```

O frontend é responsável pela interface e interação com o usuário, enquanto o backend concentra toda a lógica de negócio, autenticação, validações e comunicação com o banco de dados.

---

# Estrutura do Projeto

```text
SIGOS

├── frontend
│   ├── css
│   ├── js
│   ├── pages
│   └── assets
│
├── backend
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── services
│   ├── config
│   └── server.js
│
└── README.md
```

---

# Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)

### Backend

- Node.js
- Express.js

### Banco de Dados

- MySQL
- Sequelize ORM

### Autenticação e Segurança

- JWT (JSON Web Token)
- Bcrypt

### Serviços

- Nodemailer

### Ferramentas

- Git
- GitHub

### Deploy

- Vercel
- Railway

---

# Aprendizados

Durante o desenvolvimento do SIGOS aprofundei meus conhecimentos em desenvolvimento **full stack**, compreendendo como frontend, backend e banco de dados trabalham de forma integrada.

Aprendi a desenvolver APIs REST utilizando **Node.js** e **Express**, implementar autenticação com **JWT**, proteger senhas utilizando **Bcrypt** e manipular bancos de dados relacionais através do **Sequelize**.

Também pratiquei organização de código em camadas, integração entre cliente e servidor, controle de permissões por perfil de usuário, consumo de APIs e deploy de aplicações utilizando **Vercel** e **Railway**.

Este foi o projeto mais completo que desenvolvi durante a formação técnica, permitindo aplicar conceitos de desenvolvimento web desde a modelagem do banco de dados até a publicação da aplicação na nuvem.

---

# Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/anaolr/Sigos.git
```

Entre na pasta do projeto:

```bash
cd Sigos
```

Instale as dependências do backend:

```bash
npm install
```

Configure um arquivo `.env` contendo:

```env
DB_HOST=seu_host
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=seu_banco

JWT_SECRET=sua_chave

EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_de_app
```

Inicie o servidor:

```bash
npm start
```

---

# Como acessar

A aplicação está disponível online:

🌐 https://sigos-wheat.vercel.app

---

Projeto desenvolvido como **Projeto Integrador** do curso Técnico em Desenvolvimento de Sistemas, com foco na aplicação de conceitos de desenvolvimento **full stack**, autenticação de usuários, APIs REST, banco de dados relacional e deploy em nuvem.
````
