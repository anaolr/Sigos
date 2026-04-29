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

        // O link agora aponta para o seu domínio oficial da Vercel
        const linkRecuperacao = `https://sigos-wheat.vercel.app/pages/redefinir-senha.html?token=${token}`;

        // LOG DE SEGURANÇA: Isso permite que você veja o link no terminal do Railway 
        // mesmo que o e-mail seja bloqueado pelo servidor!
        console.log("------------------------------------------");
        console.log(`🔗 LINK DE RECUPERAÇÃO PARA ${email}:`);
        console.log(linkRecuperacao);
        console.log("------------------------------------------");

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // Variável de ambiente!
                pass: process.env.EMAIL_PASS  // Variável de ambiente!
            },
            tls: {
                family: 4,
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: `"Sistema SIGOS" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperação de Senha - SIGOS',
            html: `<h2>Recuperação de Senha</h2><p>Clique no link: <a href="${linkRecuperacao}">${linkRecuperacao}</a></p>`
        });

        res.status(200).json({ mensagem: "Processo iniciado. Verifique seu e-mail (ou os logs do sistema)." });

    } catch (error) {
        // Se der erro de envio (timeout), ainda retornamos sucesso para o usuário
        // mas avisamos no console do servidor o que houve.
        console.error("⚠️ O e-mail não pôde ser enviado via SMTP, mas o link foi gerado nos logs.");
        res.status(200).json({ mensagem: "Solicitação processada. Verifique os logs do servidor para o link." });
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