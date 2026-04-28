import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notificacao = sequelize.define("Notificacao", {
  titulo: { type: DataTypes.STRING, allowNull: false },
  mensagem: { type: DataTypes.TEXT, allowNull: false },
  tipo: { type: DataTypes.ENUM("ocorrencia", "sugestao", "sistema"), defaultValue: "sistema" },
  linkId: { type: DataTypes.INTEGER, allowNull: true }, // Guarda o ID da ocorrência/sugestão para criar o link
  lida: { type: DataTypes.BOOLEAN, defaultValue: false },
  destinatarioSetor: { type: DataTypes.STRING, allowNull: true } // Para mandar para todos de um setor
});

export default Notificacao;