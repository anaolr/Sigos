import express from "express";
import { minhasNotificacoes, marcarComoLida } from "../controllers/notificacaoController.js";

// Importa o middleware de segurança (verifique se o nome do ficheiro está correto no seu projeto)
import { auth as verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==========================================
// ROTAS DE NOTIFICAÇÃO (Todas protegidas)
// ==========================================

// Rota para buscar as notificações do utilizador logado
router.get("/", verificarToken, minhasNotificacoes);

// Rota para marcar todas as notificações do utilizador como lidas
router.put("/lidas", verificarToken, marcarComoLida);

export default router;