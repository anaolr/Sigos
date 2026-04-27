import express from "express";
import multer from "multer";
import path from "path";
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getProfile,
  updateProfile
} from "../controllers/authController.js";

// Middleware para verificar o Token JWT
import { auth as verificarToken } from "../middlewares/authMiddleware.js";

// ==============================
// CONFIGURA O MULTER PARA A FOTO DE PERFIL
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-perfil" + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

// ==============================
// ROTAS PÚBLICAS (Não precisam de login)
// ==============================

// Cadastrar usuário
router.post("/register", register);

// Login
router.post("/login", login);

// Esqueceu a senha
router.post("/forgot-password", forgotPassword);

// Redefinir a senha
router.post("/reset-password", resetPassword);

// ==============================
// ROTAS PRIVADAS (Precisam de login)
// ==============================

// Retorna os dados do próprio usuário logado
router.get("/me", verificarToken, getProfile);

// Rota para atualizar os dados e guardar a foto
router.put("/me", verificarToken, upload.single("foto"), updateProfile);

export default router;