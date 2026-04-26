import { Sugestao, User } from "../models/index.js";

// ======================================
// 1. CRIAR SUGESTÃO
// ======================================
export const criar = async (req, res) => {
  try {
    const sugestao = await Sugestao.create({
      ...req.body,
      UserId: req.user.id // Pega o ID do token JWT gerado no login
    });

    res.status(201).json({ 
      mensagem: "Sugestão enviada com sucesso!", 
      sugestao 
    });
  } catch (error) {
    console.error("Erro ao criar sugestão:", error);
    res.status(500).json({ erro: "Erro interno ao criar a sugestão." });
  }
};

// ======================================
// 2. LISTAR AS MINHAS SUGESTÕES (Funcionário/Gestor)
// ======================================
export const minhas = async (req, res) => {
  try {
    const lista = await Sugestao.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']] // Mostra as mais recentes primeiro
    });

    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar minhas sugestões:", error);
    res.status(500).json({ erro: "Erro interno ao buscar sugestões." });
  }
};

// ======================================
// 3. LISTAR TODAS AS SUGESTÕES (Admin/Gestor)
// ======================================
export const todas = async (req, res) => {
  try {
    const lista = await Sugestao.findAll({
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email', 'perfil'] // Evita trazer a senha do usuário
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar todas as sugestões:", error);
    res.status(500).json({ erro: "Erro interno ao buscar sugestões." });
  }
};

// ======================================
// 4. OBTER DETALHE DE UMA SUGESTÃO POR ID
// ======================================
export const obterPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const sugestao = await Sugestao.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email']
      }]
    });

    if (!sugestao) {
      return res.status(404).json({ erro: "Sugestão não encontrada." });
    }

    res.json(sugestao);
  } catch (error) {
    console.error("Erro ao buscar sugestão:", error);
    res.status(500).json({ erro: "Erro interno ao buscar detalhes da sugestão." });
  }
};

// ======================================
// 5. ATUALIZAR SUGESTÃO
// ======================================
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;

    // Primeiro verifica se a sugestão existe
    const sugestaoExistente = await Sugestao.findByPk(id);
    if (!sugestaoExistente) {
      return res.status(404).json({ erro: "Sugestão não encontrada." });
    }

    // Faz a atualização
    await Sugestao.update(req.body, {
      where: { id }
    });

    // Busca a sugestão atualizada para retornar
    const atualizada = await Sugestao.findByPk(id);

    res.json({ 
      mensagem: "Sugestão atualizada com sucesso!", 
      sugestao: atualizada 
    });
  } catch (error) {
    console.error("Erro ao atualizar sugestão:", error);
    res.status(500).json({ erro: "Erro interno ao atualizar a sugestão." });
  }
};