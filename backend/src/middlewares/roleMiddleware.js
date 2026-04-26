// Verifica se é Gestor ou Admin
export const isGestor = (req, res, next) => {
  // Se não for nem gestor e nem admin, bloqueia.
  if (req.user.perfil !== "gestor" && req.user.perfil !== "admin") {
    return res.status(403).json({ erro: "Acesso negado. Requer privilégios de gestor." });
  }
  next();
};

// Verifica se é ESTRITAMENTE Admin (Ex: Rota de deletar usuários)
export const isAdmin = (req, res, next) => {
  if (req.user.perfil !== "admin") {
    return res.status(403).json({ erro: "Acesso negado. Requer privilégios de administrador." });
  }
  next();
};