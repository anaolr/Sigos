import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { matricula: email }],
      },
    });

    if (!user || user.senha !== senha) {
      return res.status(401).json({
        message: "Dados incorretos. Verifique matrícula/email e senha.",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "chave_mestra_sigos",
      { expiresIn: "1d" },
    );

    return res.json({ token, role: user.role, nome: user.nome });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { nome, email, senha, role, matricula, cargo, setor } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: "Email já existe!" });

    await User.create({
      nome,
      email,
      senha,
      role: role || "funcionario",
      matricula,
      cargo,
      setor,
    });

    return res.status(201).json({ message: "Utilizador criado com sucesso!" });
  } catch (error) {
    console.error("🚨 ERRO NO CADASTRO:", error);
    return res.status(500).json({ message: "Erro ao criar utilizador", error: error.message });
  }
};

export const forgotPassword = async (req, res) => res.json({ m: "ok" });
export const resetPassword = async (req, res) => res.json({ m: "ok" });

export const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    if (nome) user.nome = nome;
    if (email) user.email = email;
    if (senha && senha.trim() !== "") user.senha = senha;

    // Se o multer recebeu uma foto do frontend, guarda-a no banco!
    if (req.file) {
      user.foto = req.file.filename;
    }

    await user.save();
    res.json({ message: "Perfil atualizado com sucesso!", nome: user.nome, foto: user.foto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar", error: error.message });
  }
};

// ======================================
// LISTAR TODOS OS USUÁRIOS
// ======================================
export const listarUsuarios = async (req, res) => {
  try {
    // Busca id, nome, role, setor e cargo de todos
    const usuarios = await User.findAll({
      attributes: ['id', 'nome', 'role', 'setor', 'cargo']
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
};