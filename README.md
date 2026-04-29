db senai: 
import { Sequelize } from "sequelize";
import "dotenv/config"; // Puxa os dados do .env
 
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
 
// Cria a conexão do Sequelize usando ESTRITAMENTE as variáveis do .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3303,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);
 
// Testa se a conexão do Sequelize deu certo
sequelize
  .authenticate()
  .then(() => console.log("🔌 Sequelize conectado com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar o Sequelize:", err));
 
export default sequelize;


 .env:
 DB_NAME=sigos
DB_USER=root
DB_PASSWORD=alunolab
DB_HOST=127.0.0.1
DB_PORT=3303
DB_DIALECT=mysql


server.js:
import "dotenv/config";
import mysql from "mysql2/promise";
import app from "./app.js";
import sequelize from "./config/db.js";
import "./models/index.js";

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        console.log("⏳ 1. Verificando MySQL...");
        const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // 👈 AQUI
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.end();
        console.log(`✅ 2. Banco '${process.env.DB_NAME}' OK.`);

        await sequelize.authenticate();
        console.log("🔌 3. Sequelize conectado.");

        await sequelize.sync({ alter: true });
        console.log("✅ 4. Tabelas sincronizadas.");

        // Tenta ligar o servidor e segura o processo aberto
        const server = app.listen(PORT, () => {
            console.log(`🚀 5. SERVIDOR ATIVO EM: http://localhost:${PORT}`);
            console.log("📢 Aguardando pedidos do frontend...");
        });

        // Se a porta estiver ocupada, ele avisa em vez de só fechar
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`❌ Erro: A porta ${PORT} já está a ser usada por outro programa!`);
            } else {
                console.error("❌ Erro no servidor:", e);
            }
        });

    } catch (error) {
        console.error("🚨 ERRO FATAL AO INICIAR:", error);
    }
}

iniciarServidor();

