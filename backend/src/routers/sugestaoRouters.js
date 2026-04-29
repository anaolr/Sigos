import express from "express";
import multer from "multer";
import path from "path";
import { criar, minhas, todas, atualizar, obterPorId ,votar} from "../controllers/sugestaoController.js";
import { auth } from "../middlewares/authMiddleware.js";

// CONFIGURAÇÃO DO MULTER PARA AS SUGESTÕES
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// A ROTA POST AGORA TEM O UPLOAD
router.post("/", auth, upload.single("anexo"), criar);
router.get("/minhas", auth, minhas);
router.get("/todas", auth, todas);
router.get("/:id", auth, obterPorId);
router.put("/:id/votar", auth, votar);
router.put("/:id", auth, atualizar);

export default router;