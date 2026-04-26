import express from "express";
import { criar, minhas, todas, atualizar, obterPorId } from "../controllers/ocorrenciaController.js";
import { auth } from "../middlewares/authMiddleware.js"; // Ou como quer que se chame seu middleware

const router = express.Router();

router.post("/", auth, criar);
router.get("/minhas", auth, minhas);
router.get("/todas", auth, todas); // Você pode colocar o roleMiddleware aqui depois para bloquear para quem não é gestor
router.get("/:id", auth, obterPorId); // A ROTA NOVA AQUI!
router.put("/:id", auth, atualizar);

export default router;