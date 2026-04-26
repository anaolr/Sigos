import express from "express";
import cors from "cors";
import authRoutes from "./routers/authRouters.js";
import ocorrenciaRoutes from "./routers/ocorrenciaRoutes.js";
import sugestaoRoutes from "./routers/sugestaoRouters.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/ocorrencias", ocorrenciaRoutes);
app.use("/api/sugestoes", sugestaoRoutes);

// --- MÉDICO DE ERROS (Não deixa o servidor cair por erro bobo) ---
app.use((err, req, res, next) => {
    console.error("❌ Erro capturado pelo middleware:", err.stack);
    res.status(500).json({ message: "Algo correu mal no servidor!", error: err.message });
});

export default app;