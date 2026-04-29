import { Op } from "sequelize";
import { Sugestao, User, Notificacao } from "../models/index.js";

// ======================================
// 1. CRIAR SUGESTÃO E NOTIFICAR
// ======================================
export const criar = async (req, res) => {
  try {
    const dados = { ...req.body };
    if (req.file) dados.anexo = req.file.filename;

    const sugestao = await Sugestao.create({
      ...dados,
      UserId: req.user.id
    });

    // --- GATILHO DE NOTIFICAÇÃO (INVISÍVEL E COM ADMIN) ---
    const processarNotificacoes = async () => {
        try {
            const autor = await User.findByPk(req.user.id);
            const nomeAutor = autor ? autor.nome : "Um funcionário";
            const setorAlvo = dados.setor || "Geral";

            const alvos = await User.findAll({
                where: {
                    [Op.or]: [
                        { role: 'admin' },
                        { role: 'gestor', setor: setorAlvo }
                    ]
                }
            });

            const promessas = alvos.map(alvo => {
                return Notificacao.create({
                    titulo: "Nova Sugestão",
                    mensagem: `${nomeAutor} enviou uma ideia: "${dados.titulo}" para o setor ${setorAlvo}.`,
                    tipo: "sugestao",
                    linkId: sugestao.id,
                    UserId: alvo.id
                });
            });
            await Promise.all(promessas);
        } catch (erro) {
            console.error("Falha silenciosa ao notificar sugestão:", erro);
        }
    };
    
    processarNotificacoes(); // Executa em segundo plano
    // ----------------------------------------------------

    return res.status(201).json({ 
      mensagem: "Sugestão enviada com sucesso!", 
      sugestao 
    });
  } catch (error) {
    console.error("Erro ao criar sugestão:", error);
    return res.status(500).json({ erro: "Erro interno ao criar a sugestão." });
  }
};

// ======================================
// 2. LISTAR AS MINHAS SUGESTÕES
// ======================================
export const minhas = async (req, res) => {
  try {
    const lista = await Sugestao.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(lista);
  } catch (error) {
    console.error("Erro ao buscar minhas sugestões:", error);
    res.status(500).json({ erro: "Erro interno ao buscar sugestões." });
  }
};

// ======================================
// 3. LISTAR TODAS AS SUGESTÕES
// ======================================
export const todas = async (req, res) => {
  try {
    const lista = await Sugestao.findAll({
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email', 'role', 'setor']
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
      include: [{ model: User, attributes: ["nome", "email", "setor"] }]
    });

    if (!sugestao) {
      return res.status(404).json({ erro: "Sugestão não encontrada no banco." });
    }
    res.json(sugestao);
  } catch (error) {
    console.error("Erro ao buscar sugestão:", error);
    res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

// ======================================
// 5. ATUALIZAR E NOTIFICAR FUNCIONÁRIO
// ======================================
export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const sugestaoExistente = await Sugestao.findByPk(id);
    if (!sugestaoExistente) {
      return res.status(404).json({ erro: "Sugestão não encontrada." });
    }

    await Sugestao.update(req.body, { where: { id } });
    const atualizada = await Sugestao.findByPk(id);

    // --- GATILHO DE NOTIFICAÇÃO (PARA O FUNCIONÁRIO) ---
    if (req.body.status && req.body.status !== sugestaoExistente.status) {
        try {
            await Notificacao.create({
                titulo: "Parecer da Sugestão",
                mensagem: `A sua sugestão "${atualizada.titulo}" foi ${atualizada.status}.`,
                tipo: "sugestao",
                linkId: atualizada.id,
                UserId: atualizada.UserId // Envia para quem criou
            });
        } catch (errNotif) {
            console.error("Erro silencioso ao notificar", errNotif);
        }
    }
    // ---------------------------------------------------

    res.json({ 
      mensagem: "Sugestão atualizada com sucesso!", 
      sugestao: atualizada 
    });
  } catch (error) {
    console.error("Erro ao atualizar sugestão:", error);
    res.status(500).json({ erro: "Erro interno ao atualizar a sugestão." });
  }
};

// ======================================
// 6. REGISTAR VOTO (Liberado para todos)
// ======================================
export const votar = async (req, res) => {
    try {
        const { id } = req.params;
        const sugestao = await Sugestao.findByPk(id);
        
        if (!sugestao) {
            return res.status(404).json({ erro: "Sugestão não encontrada." });
        }

        // Soma 1 ao valor atual no banco de dados
        await Sugestao.update({ votos: (sugestao.votos || 0) + 1 }, { where: { id } });
        
        res.json({ mensagem: "Voto registado com sucesso!" });
    } catch (error) {
        console.error("Erro ao votar:", error);
        res.status(500).json({ erro: "Erro ao registar o voto." });
    }
};