import { Op } from "sequelize";
import { Ocorrencia, User, Notificacao } from "../models/index.js";

// ======================================
// 1. CRIAR OCORRÊNCIA E NOTIFICAR
// ======================================
export const criar = async (req, res) => {
  try {
    const dados = { ...req.body };
    if (req.file) dados.anexo = req.file.filename;

    // 1. Grava a Ocorrência (Garante o salvamento no banco)
    const ocorrencia = await Ocorrencia.create({
      ...dados,
      UserId: req.user.id,
    });

    // 2. Dispara notificações no "plano de fundo"
    // Esta função auto-executável previne bloqueios
    (async () => {
      try {
        const autor = await User.findByPk(req.user.id);
        const nomeAutor = autor ? autor.nome : "Um funcionário";
        const setorAlvo = dados.setorResponsavel || "Geral";

        // Busca gestores do setor alvo E todos os administradores em uma única query
        const alvos = await User.findAll({
          where: {
            [Op.or]: [
              { role: "admin" },
              { role: "gestor", setor: setorAlvo }
            ]
          }
        });

        const promessasNotificacao = alvos.map((alvo) => {
          return Notificacao.create({
            titulo: "Nova Ocorrência",
            mensagem: `${nomeAutor} registrou: "${dados.titulo}" para o setor ${setorAlvo}.`,
            tipo: "ocorrencia",
            linkId: ocorrencia.id,
            UserId: alvo.id,
          });
        });

        await Promise.all(promessasNotificacao);
      } catch (erroNotificacao) {
        console.error("Falha silenciosa ao gerar notificações:", erroNotificacao);
      }
    })(); // Os parênteses extra executam a função imediatamente

    // 3. Responde imediatamente com sucesso ao Frontend (É isto que tira a mensagem vermelha)
    return res.status(201).json({ 
        mensagem: "Ocorrência registrada com sucesso!", 
        ocorrencia 
    });

  } catch (error) {
    console.error("Erro crítico ao criar ocorrência:", error);
    return res.status(500).json({ erro: "Erro interno ao criar a ocorrência." });
  }
};

// ======================================
// 2. LISTAR AS MINHAS OCORRÊNCIAS
// ======================================
export const minhas = async (req, res) => {
  try {
    const usuarioLogado = await User.findByPk(req.user.id);
    
    const lista = await Ocorrencia.findAll({
      where: {
        [Op.or]: [
          { UserId: req.user.id },
          { responsavel: usuarioLogado ? usuarioLogado.nome : null }
        ]
      },
      include: [{ model: User, attributes: ['nome'] }], 
      order: [['createdAt', 'DESC']]
    });
    
    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar minhas ocorrências:", error);
    res.status(500).json({ erro: "Erro interno ao buscar ocorrências." });
  }
};

// ======================================
// 3. LISTAR TODAS (COM NOME, EMAIL E ROLE)
// ======================================
export const todas = async (req, res) => {
  try {
    const lista = await Ocorrencia.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nome", "email", "role", "setor"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar todas as ocorrências:", error);
    res.status(500).json({ erro: "Erro interno ao buscar ocorrências." });
  }
};

// ======================================
// 4. OBTER DETALHE POR ID
// ======================================
export const obterPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "nome", "email", "setor"],
        },
      ],
    });

    if (!ocorrencia) {
      return res.status(404).json({ erro: "Ocorrência não encontrada." });
    }
    res.json(ocorrencia);
  } catch (error) {
    console.error("Erro ao buscar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao buscar detalhes." });
  }
};

// ======================================
// 5. ATUALIZAR E NOTIFICAR O FUNCIONÁRIO
// ======================================
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const ocorrenciaExistente = await Ocorrencia.findByPk(id);
    if (!ocorrenciaExistente) {
      return res.status(404).json({ erro: "Ocorrência não encontrada." });
    }

    await Ocorrencia.update(req.body, { where: { id } });
    const atualizada = await Ocorrencia.findByPk(id);

    // --- GATILHO DE NOTIFICAÇÃO (BLINDADO) ---
    if (req.body.status && req.body.status !== ocorrenciaExistente.status) {
      try {
        await Notificacao.create({
          titulo: "Atualização de Ocorrência",
          mensagem: `A sua ocorrência "${atualizada.titulo}" mudou para: ${atualizada.status}.`,
          tipo: "ocorrencia",
          linkId: atualizada.id,
          UserId: atualizada.UserId, 
        });
      } catch (errNotificacao) {
        console.error("Erro ao notificar atualização de status:", errNotificacao);
      }
    }
    // ---------------------------------------------------

    res.json({
      mensagem: "Ocorrência atualizada com sucesso!",
      ocorrencia: atualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao atualizar." });
  }
};