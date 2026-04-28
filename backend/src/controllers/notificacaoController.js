import { Notificacao } from "../models/index.js";

export const minhasNotificacoes = async (req, res) => {
  try {
    const lista = await Notificacao.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar notificações." });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    await Notificacao.update({ lida: true }, { where: { UserId: req.user.id } });
    res.json({ mensagem: "Notificações marcadas como lidas." });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar notificações." });
  }
};