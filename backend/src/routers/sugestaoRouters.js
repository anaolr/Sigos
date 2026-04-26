import express from "express";
import * as controller from "../controllers/sugestaoController.js";
import { auth } from "../middlewares/authMiddleware.js";
import { isGestor } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ==============================
// ROTAS GERAIS (Qualquer usuário logado)
// ==============================
router.post("/", auth, controller.criar);
router.get("/minhas", auth, controller.minhas);

// ROTA NOVA: Obter detalhe de uma sugestão pelo ID (Atenção: sempre depois de "/minhas")
router.get("/:id", auth, controller.obterPorId);

// ==============================
// ROTAS DE GESTÃO (Apenas Gestor/Admin)
// ==============================
router.get("/", auth, isGestor, controller.todas);
router.put("/:id", auth, isGestor, controller.atualizar);

export default router;