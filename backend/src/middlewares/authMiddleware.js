import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Acesso negado. Sem token." });
  }

  // Divide o cabeçalho "Bearer <token>" em duas partes e pega apenas o token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ erro: "Erro de formatação do token." });
  }

  const token = parts[1];

  try {
    // Mesma chave de fallback que usamos no authController
    const secret = process.env.JWT_SECRET || "minha_chave_secreta_padrao"; 
    const decoded = jwt.verify(token, secret);
    
    // Salva os dados do usuário (id, perfil) para os próximos controladores usarem
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};