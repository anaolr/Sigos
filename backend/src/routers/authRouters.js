import express from "express";
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getProfile 
} from "../controllers/authController.js";

// Se você já tem um middleware para verificar o Token JWT, importe-o aqui
import { auth as verificarToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

// ==============================
// ROTAS PÚBLICAS (Não precisam de login)
// ==============================

// Cadastrar usuário
router.post("/register", register);

// Login
router.post("/login", login);

// Esqueceu a senha (envia email/código de recuperação)
router.post("/forgot-password", forgotPassword);

// Redefinir a senha (recebe o token/código e a nova senha)
router.post("/reset-password", resetPassword);

// ==============================
// ROTAS PRIVADAS (Precisam de login)
// ==============================

// Retorna os dados do próprio usuário logado (útil para as páginas de Perfil e Dashboard)
router.get("/me", verificarToken, getProfile);

export default router;