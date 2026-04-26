import { Sequelize } from "sequelize";
import "dotenv/config"; // Puxa os dados do .env

// Cria a conexão do Sequelize usando ESTRITAMENTE as variáveis do .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false, // Coloque "console.log" aqui se quiser ver os comandos SQL no terminal
  },
);

// Testa se a conexão do Sequelize deu certo
sequelize
  .authenticate()
  .then(() => console.log("🔌 Sequelize conectado com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar o Sequelize:", err));

export default sequelize;
