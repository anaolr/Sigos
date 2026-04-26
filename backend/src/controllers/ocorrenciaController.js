import { Ocorrencia, User } from "../models/index.js";

// ======================================
// 1. CRIAR OCORRÊNCIA
// ======================================
export const criar = async (req, res) => {
  try {
    const ocorrencia = await Ocorrencia.create({
      ...req.body,
      UserId: req.user.id // Pega o ID do token JWT gerado no login
    });

    res.status(201).json({ 
      mensagem: "Ocorrência registrada com sucesso!", 
      ocorrencia 
    });
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao criar a ocorrência." });
  }
};

// ======================================
// 2. LISTAR AS MINHAS OCORRÊNCIAS (Funcionário)
// ======================================
export const minhas = async (req, res) => {
  try {
    const lista = await Ocorrencia.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']] // Mostra as mais recentes primeiro
    });

    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar minhas ocorrências:", error);
    res.status(500).json({ erro: "Erro interno ao buscar ocorrências." });
  }
};

// ======================================
// 3. LISTAR TODAS AS OCORRÊNCIAS (Gestor/Admin)
// ======================================
export const todas = async (req, res) => {
  try {
    const lista = await Ocorrencia.findAll({
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email', 'perfil'] // Evita trazer a senha do usuário
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar todas as ocorrências:", error);
    res.status(500).json({ erro: "Erro interno ao buscar ocorrências." });
  }
};

// ======================================
// 4. OBTER DETALHE DE UMA OCORRÊNCIA POR ID
// ======================================
export const obterPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const ocorrencia = await Ocorrencia.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email']
      }]
    });

    if (!ocorrencia) {
      return res.status(404).json({ erro: "Ocorrência não encontrada." });
    }

    res.json(ocorrencia);
  } catch (error) {
    console.error("Erro ao buscar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao buscar detalhes da ocorrência." });
  }
};

// ======================================
// 5. ATUALIZAR OCORRÊNCIA (Ex: Gestor mudando status)
// ======================================
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;

    // Primeiro verifica se a ocorrência existe
    const ocorrenciaExistente = await Ocorrencia.findByPk(id);
    if (!ocorrenciaExistente) {
      return res.status(404).json({ erro: "Ocorrência não encontrada." });
    }

    // Faz a atualização
    await Ocorrencia.update(req.body, {
      where: { id }
    });

    // Busca a ocorrência atualizada para retornar ao front-end
    const atualizada = await Ocorrencia.findByPk(id);

    res.json({ 
      mensagem: "Ocorrência atualizada com sucesso!", 
      ocorrencia: atualizada 
    });
  } catch (error) {
    console.error("Erro ao atualizar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao atualizar a ocorrência." });
  }
};