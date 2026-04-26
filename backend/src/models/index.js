import User from "./User.js";
import Ocorrencia from "./Ocorrencia.js";
import Sugestao from "./Sugestao.js";

// relações
User.hasMany(Ocorrencia);
Ocorrencia.belongsTo(User);

User.hasMany(Sugestao);
Sugestao.belongsTo(User);

// 👇 EXPORTAÇÃO CORRETA
export { User, Ocorrencia, Sugestao };