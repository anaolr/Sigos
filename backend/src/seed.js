import "dotenv/config";
import sequelize from "./config/db.js";
import User from "./models/User.js";

async function criarAdmin() {
    try {
        // Conecta no banco
        await sequelize.authenticate();
        console.log("🔌 Conectado ao banco para criar o Admin...");

        // Verifica se o admin já existe para não criar duplicado
        const adminExistente = await User.findOne({ where: { email: 'admin@sigos.com' } });

        if (adminExistente) {
            console.log("⚠️ O usuário Admin já existe no banco!");
        } else {
            // Cria o usuário direto no banco
            await User.create({
                nome: "Administrador Master",
                email: "admin@sigos.com",
                senha: "123", // Sua senha para teste
                role: "admin",
                matricula: "0000",
                cargo: "Diretoria",
                setor: "Administração"
            });
            console.log("✅ Usuário Admin criado com sucesso!");
            console.log("📧 Email para login: admin@sigos.com");
            console.log("🔑 Senha para login: 123");
        }
    } catch (error) {
        console.error("❌ Erro ao criar admin:", error);
    } finally {
        process.exit(); // Desliga o script após terminar
    }
}

criarAdmin();