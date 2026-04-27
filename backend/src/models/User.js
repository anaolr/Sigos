import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    matricula: {
        type: DataTypes.STRING,
        allowNull: true, // Necessário para a base de dados não apagar a matrícula
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: true, // Necessário para o cargo
    },
   setor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  foto: DataTypes.STRING // <-- ADICIONE ESTA LINHA
,
    role: {
        type: DataTypes.ENUM("admin", "gestor", "funcionario"),
        defaultValue: "funcionario",
    },
});

export default User;