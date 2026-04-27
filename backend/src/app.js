import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routers/authRouters.js";
import ocorrenciaRoutes from "./routers/ocorrenciaRoutes.js";
import sugestaoRoutes from "./routers/sugestaoRouters.js";

// Configuração necessária para ler ficheiros em projetos do tipo "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// MAGIA AQUI: Torna a pasta "uploads" pública para podermos ver as imagens no Frontend
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/ocorrencias", ocorrenciaRoutes);
app.use("/api/sugestoes", sugestaoRoutes);

app.use((err, req, res, next) => {
    console.error("❌ Erro capturado pelo middleware:", err.stack);
    res.status(500).json({ message: "Algo correu mal no servidor!", error: err.message });
});

export default app;