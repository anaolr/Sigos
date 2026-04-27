import express from "express";
import multer from "multer";
import path from "path";
import { criar, minhas, todas, atualizar, obterPorId } from "../controllers/ocorrenciaController.js";
import { auth } from "../middlewares/authMiddleware.js"; 

// CONFIGURAÇÃO DO MULTER: Define ONDE guardar e QUAL O NOME dar ao ficheiro
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Guarda na pasta que criámos
  },
  filename: function (req, file, cb) {
    // Adiciona a data atual ao nome da imagem para que não existam ficheiros com o mesmo nome
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

// A rota de CRIAR agora exige o "upload.single('anexo')" antes de chamar o controlador
router.post("/", auth, upload.single("anexo"), criar);
router.get("/minhas", auth, minhas);
router.get("/todas", auth, todas); 
router.get("/:id", auth, obterPorId); 
router.put("/:id", auth, atualizar);

export default router;