import { Ocorrencia, User, Notificacao } from "../models/index.js";

// ======================================
// 1. CRIAR OCORRÊNCIA E NOTIFICAR GESTOR
// ======================================
export const criar = async (req, res) => {
  try {
    const dados = { ...req.body };

    if (req.file) {
      dados.anexo = req.file.filename;
    }

    const ocorrencia = await Ocorrencia.create({
      ...dados,
      UserId: req.user.id 
    });

    // --- GATILHO DE NOTIFICAÇÃO ---
    // 1. Descobrir quem é o autor para colocar o nome na notificação
    const autor = await User.findByPk(req.user.id);
    const nomeAutor = autor ? autor.nome : "Um funcionário";

    // 2. Encontrar todos os gestores do setor responsável
    if (dados.setorResponsavel) {
        const gestores = await User.findAll({
            where: { role: 'gestor', setor: dados.setorResponsavel }
        });

        // 3. Criar uma notificação para cada gestor encontrado
        const promessasNotificacao = gestores.map(gestor => {
            return Notificacao.create({
                titulo: "Nova Ocorrência",
                mensagem: `${nomeAutor} registou: "${dados.titulo}" para o seu setor.`,
                tipo: "ocorrencia",
                linkId: ocorrencia.id,
                UserId: gestor.id
            });
        });
        await Promise.all(promessasNotificacao);
    }
    // -----------------------------

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
// 2. LISTAR AS MINHAS OCORRÊNCIAS
// ======================================
export const minhas = async (req, res) => {
  try {
    const lista = await Ocorrencia.findAll({
      where: { UserId: req.user.id },
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
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email', 'role', 'setor'] 
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
// 4. OBTER DETALHE POR ID
// ======================================
export const obterPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'nome', 'email', 'setor']
      }]
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

    // --- GATILHO DE NOTIFICAÇÃO (PARA O FUNCIONÁRIO) ---
    // Se o status mudou e quem alterou não foi o próprio autor, avisa o autor
    if (req.body.status && req.body.status !== ocorrenciaExistente.status) {
        await Notificacao.create({
            titulo: "Atualização de Ocorrência",
            mensagem: `A sua ocorrência "${atualizada.titulo}" mudou para: ${atualizada.status}.`,
            tipo: "ocorrencia",
            linkId: atualizada.id,
            UserId: atualizada.UserId // Envia para quem criou a ocorrência
        });
    }
    // ---------------------------------------------------

    res.json({ 
      mensagem: "Ocorrência atualizada com sucesso!", 
      ocorrencia: atualizada 
    });
  } catch (error) {
    console.error("Erro ao atualizar ocorrência:", error);
    res.status(500).json({ erro: "Erro interno ao atualizar." });
  }
};