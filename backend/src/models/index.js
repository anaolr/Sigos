import User from "./User.js";
import Ocorrencia from "./Ocorrencia.js";
import Sugestao from "./Sugestao.js";
import Notificacao from "./Notificacao.js";

// relações
User.hasMany(Ocorrencia);
Ocorrencia.belongsTo(User);

User.hasMany(Sugestao);
Sugestao.belongsTo(User);

User.hasMany(Notificacao);
Notificacao.belongsTo(User);

// 👇 EXPORTAÇÃO CORRETA
export { User, Ocorrencia, Sugestao, Notificacao };