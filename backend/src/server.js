// import "dotenv/config";
// import mysql from "mysql2/promise";
// import app from "./app.js";
// import sequelize from "./config/db.js";
// import "./models/index.js";

// const PORT = process.env.PORT || 3000;

// async function iniciarServidor() {
//     try {
//         console.log("⏳ 1. Verificando MySQL...");
//         const connection = await mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD
//         });
//         await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
//         await connection.end();
//         console.log(`✅ 2. Banco '${process.env.DB_NAME}' OK.`);

//         await sequelize.authenticate();
//         console.log("🔌 3. Sequelize conectado.");

//         await sequelize.sync({ alter: true });
//         console.log("✅ 4. Tabelas sincronizadas.");

//         // Tenta ligar o servidor e segura o processo aberto
//         const server = app.listen(PORT, () => {
//             console.log(`🚀 5. SERVIDOR ATIVO EM: http://localhost:${PORT}`);
//             console.log("📢 Aguardando pedidos do frontend...");
//         });

//         // Se a porta estiver ocupada, ele avisa em vez de só fechar
//         server.on('error', (e) => {
//             if (e.code === 'EADDRINUSE') {
//                 console.error(`❌ Erro: A porta ${PORT} já está a ser usada por outro programa!`);
//             } else {
//                 console.error("❌ Erro no servidor:", e);
//             }
//         });

//     } catch (error) {
//         console.error("🚨 ERRO FATAL AO INICIAR:", error);
//     }
// }

// iniciarServidor();


import "dotenv/config";
import app from "./app.js";
import sequelize from "./config/db.js";
import "./models/index.js";

// O Railway injeta automaticamente a porta correta na variável process.env.PORT
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        console.log("⏳ 1. Conectando ao MySQL no Railway...");
        
        // O Sequelize já usa o DB_NAME do seu .env, então ele tenta conectar direto no banco certo
        await sequelize.authenticate();
        console.log("🔌 2. Sequelize conectado com sucesso.");

        // Sincroniza as tabelas (cria as tabelas se não existirem no banco do Railway)
        await sequelize.sync({ alter: true });
        console.log("✅ 3. Tabelas sincronizadas.");

        // Inicia o servidor ouvindo em 0.0.0.0 (obrigatório para deploy em nuvem)
        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 4. SERVIDOR ONLINE NA PORTA: ${PORT}`);
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`❌ Erro: A porta ${PORT} já está em uso.`);
            } else {
                console.error("❌ Erro no servidor:", e);
            }
        });

    } catch (error) {
        console.error("🚨 ERRO FATAL AO INICIAR O BACKEND:", error);
        // Em produção, se o banco falhar, é melhor o processo fechar para o serviço reiniciar
        process.exit(1); 
    }
}

iniciarServidor();