import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User, Notificacao } from "../models/index.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs"; // Necessário para encriptar a nova senha

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

    // CORREÇÃO: Guardar o utilizador na variável newUser para usar na notificação abaixo
    const newUser = await User.create({
      nome,
      email,
      senha,
      role: role || "funcionario",
      matricula,
      cargo,
      setor,
    });

    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const promessas = admins.map(admin => {
          return Notificacao.create({
              titulo: "Novo utilizador registado",
              mensagem: `O utilizador "${newUser.nome}" foi cadastrado como ${newUser.role} no setor ${newUser.setor}.`,
              tipo: "usuario",
              linkId: null,
              UserId: admin.id
          });
      });
      await Promise.all(promessas);
    } catch (errNotif) {
        console.error("Erro silencioso ao notificar novo utilizador:", errNotif);
    }

    return res.status(201).json({ message: "Utilizador criado com sucesso!" });
  } catch (error) {
    console.error("🚨 ERRO NO CADASTRO:", error);
    return res.status(500).json({ message: "Erro ao criar utilizador", error: error.message });
  }
};

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

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'nome', 'role', 'setor', 'cargo']
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuários", error: error.message });
  }
};

// ======================================
// RECUPERAÇÃO DE SENHA VIA E-MAIL
// ======================================
export const solicitarRecuperacao = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(200).json({ mensagem: "Se o e-mail existir, receberá um link de recuperação." });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiracao = new Date();
        expiracao.setHours(expiracao.getHours() + 1);

        await User.update(
            { resetToken: token, resetTokenExpires: expiracao }, 
            { where: { id: user.id } }
        );

        // CONFIGURAÇÃO AJUSTADA PARA O RAILWAY (Porta 465)
        const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: 'ana.freitas0046@gmail.com',
        pass: 'zamt asgu wlln jeti'
    },
    // CONFIGURAÇÕES DE TIMEOUT (Para evitar o ETIMEDOUT)
    connectionTimeout: 20000, // 20 segundos
    greetingTimeout: 20000,
    socketTimeout: 20000,
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2" // Força uma versão estável do protocolo
    }
});

        // CORREÇÃO DO LINK: Agora ele usa o link da VERCEL onde está o seu site
       const linkRecuperacao = `https://sigos-wheat.vercel.app/pages/redefinir-senha.html?token=${token}`;

        await transporter.sendMail({
            from: '"Sistema SIGOS" <ana.freitas0046@gmail.com>',
            to: email,
            subject: 'Recuperação de Senha - SIGOS',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Recuperação de Senha</h2>
                    <p>Olá, <strong>${user.nome}</strong>!</p>
                    <p>Você solicitou a alteração da sua senha no SIGOS.</p>
                    <p>Clique no botão abaixo para criar uma nova senha (este link expira em 1 hora):</p>
                    <a href="${linkRecuperacao}" style="display:inline-block; padding:12px 25px; background-color:#007bff; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Redefinir Minha Senha</a>
                    <p style="margin-top:20px; font-size: 12px; color: #777;">Se você não solicitou isso, ignore este e-mail.</p>
                </div>
            `
        });

        res.status(200).json({ mensagem: "Se o e-mail existir, receberá um link de recuperação." });

    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        res.status(500).json({ erro: "Erro ao processar a solicitação." });
    }
};

export const redefinirSenha = async (req, res) => {
    try {
        const { token, novaSenha } = req.body;

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpires: { [Op.gt]: new Date() } // Verifica se ainda está no prazo
            }
        });

        if (!user) {
            return res.status(400).json({ erro: "Token inválido ou expirado." });
        }

        // Caso a sua base use bcrypt (se não usar, tire as 2 linhas abaixo e passe a novaSenha direto)
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(novaSenha, salt);

        await User.update(
            { senha: novaSenha, resetToken: null, resetTokenExpires: null }, // Atualizei para o nome da coluna que usa: "senha"
            { where: { id: user.id } }
        );

        res.json({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ erro: "Erro interno ao atualizar a senha." });
    }
};