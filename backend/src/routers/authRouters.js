import express from "express";
import multer from "multer";
import path from "path";
import { 
  register, 
  login, 
  solicitarRecuperacao, 
  redefinirSenha, 
  getProfile,
  updateProfile,
  listarUsuarios
} from "../controllers/authController.js";

import { auth as verificarToken } from "../middlewares/authMiddleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-perfil" + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

// ==============================
// ROTAS PÚBLICAS (Não precisam de login)
// ==============================

router.post("/register", register);
router.post("/login", login);

// Rotas de recuperação de senha conectadas ao Frontend
router.post("/esqueci-senha", solicitarRecuperacao);
router.post("/redefinir-senha", redefinirSenha);

// ==============================
// ROTAS PRIVADAS (Precisam de login)
// ==============================

router.get("/me", verificarToken, getProfile);
router.put("/me", verificarToken, upload.single("foto"), updateProfile);
router.get("/users", verificarToken, listarUsuarios);

export default router;