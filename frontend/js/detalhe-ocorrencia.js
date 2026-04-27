document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const nome = localStorage.getItem("nome");

  if (!token) {
    localStorage.clear();
    window.location.href = "./login.html";
    return;
  }

  const nomeSidebar = document.getElementById("nome-sidebar");
  const perfilSidebar = document.getElementById("perfil-sidebar");
  const ferramentas = document.getElementById("ferramentas");

  if (nomeSidebar && nome) nomeSidebar.textContent = nome;

  const btnSair = document.getElementById("btn-logout");
  if (btnSair) {
    btnSair.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "./login.html";
    });
  }

  const blocoGestao = document.getElementById("bloco-gestao");
  const blocoResponsavel = document.getElementById("bloco-responsavel");
  const blocoObservacao = document.getElementById("bloco-observacao");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnReabrir = document.getElementById("btn-reabrir");
  const btnPdf = document.getElementById("btn-pdf");

  const campos = {
    titulo: document.getElementById("titulo"),
    descricao: document.getElementById("descricao"),
    categoria: document.getElementById("categoria"),
    setorOrigem: document.getElementById("setor_origem"),
    setorResponsavel: document.getElementById("setor_responsavel"),
    local: document.getElementById("local"),
    urgencia: document.getElementById("urgencia"),
    autor: document.getElementById("autor"),
    dataEnvio: document.getElementById("data_envio"),
    status: document.getElementById("status"),
    prioridade: document.getElementById("prioridade"),
    responsavelOcorrencia: document.getElementById("responsavel_ocorrencia"),
    responsavelAtual: document.getElementById("responsavel_atual"),
    observacao: document.getElementById("observacao_gestor"),
    anexo: document.getElementById("preview-anexo"),
    mensagem: document.getElementById("mensagem-ocorrencia"),
    form: document.getElementById("form-ocorrencia"),
  };

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  function montarMenu(perfil) {
    const perfisNomes = {
      funcionario: "Funcionário",
      gestor: "Gestor",
      admin: "Administrador",
    };
    if (perfilSidebar)
      perfilSidebar.textContent = perfisNomes[perfil] || "Usuário";

    if (perfil === "funcionario") {
      ferramentas.innerHTML = `
        <div class="link-menu"><i class="fa-solid fa-house"></i><a href="./dashboard-funcionario.html">Início</a></div>
        <div class="link-menu"><i class="fa-solid fa-circle-exclamation"></i><a href="./nova-ocorrencia.html">Nova ocorrência</a></div>
        <div class="link-menu"><i class="fa-solid fa-lightbulb"></i><a href="./nova-sugestao.html">Nova sugestão</a></div>
        <div class="link-menu"><i class="fa-solid fa-folder-open"></i><a href="./minhas-solicitacoes.html">Minhas solicitações</a></div>
        <div class="link-menu"><i class="fa-solid fa-comments"></i><a href="./mural-sugestoes.html">Mural de Sugestões</a></div>
        <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-funcionario.html">Perfil</a></div>
      `;
    } else if (perfil === "gestor") {
      ferramentas.innerHTML = `
        <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-gestor.html">Perfil</a></div>
        <div class="link-menu"><i class="fa-solid fa-folder-open"></i><a href="./painel-solicitacoes-gestor.html">Solicitações</a></div>
        <div class="link-menu"><i class="fa-solid fa-table-columns"></i><a href="./dashboard-gestor.html">Dashboard</a></div>
        <div class="link-menu"><i class="fa-solid fa-bell"></i><a href="./notificacoes.html">Notificações</a></div>
      `;
    } else if (perfil === "admin") {
      ferramentas.innerHTML = `
        <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-admin.html">Perfil</a></div>
        <div class="link-menu"><i class="fa-solid fa-user-plus"></i><a href="./cadastro-usuario.html">Cadastro</a></div>
        <div class="link-menu"><i class="fa-solid fa-chart-line"></i><a href="./dashboard-admin.html">Dashboard</a></div>
        <div class="link-menu"><i class="fa-solid fa-bell"></i><a href="./notificacoes-admin.html">Notificações</a></div>
      `;
    }
  }

  function aplicarPermissoes(perfil) {
    if (perfil === "gestor" || perfil === "admin") {
      campos.status.disabled = false;
      campos.prioridade.disabled = false;
      if (campos.responsavelOcorrencia) campos.responsavelOcorrencia.disabled = false;
      campos.observacao.disabled = false;
      if (blocoGestao) blocoGestao.style.display = "grid";
      if (blocoResponsavel) blocoResponsavel.style.display = "block";
      if (blocoObservacao) blocoObservacao.style.display = "block";
      if (btnSalvar) btnSalvar.style.display = "inline-block";
    } else {
      campos.status.disabled = true;
      campos.prioridade.disabled = true;
      if (campos.responsavelOcorrencia) campos.responsavelOcorrencia.disabled = true;
      campos.observacao.disabled = true;
      if (blocoGestao) blocoGestao.style.display = "none";
      if (blocoResponsavel) blocoResponsavel.style.display = "none";
      if (blocoObservacao) blocoObservacao.style.display = "none";
      if (btnSalvar) btnSalvar.style.display = "none";
      if (btnReabrir) btnReabrir.style.display = "none";
    }
  }

  // ====================================================
  // FUNÇÃO MÁGICA: Converte 'manutencao' em 'Manutenção'
  // ====================================================
  function formatarSetor(setor) {
    if (!setor || setor === "N/A") return "N/A";
    const s = String(setor).toLowerCase();
    if (s === "ti") return "TI";
    if (s === "rh") return "RH";
    if (s === "manutencao") return "Manutenção";
    if (s === "limpeza") return "Limpeza";
    if (s === "administrativo") return "Administrativo";
    if (s === "seguranca" || s === "segurança") return "Segurança";
    return setor.charAt(0).toUpperCase() + setor.slice(1);
  }

  async function carregarDadosReais() {
    try {
      const response = await fetch(`http://localhost:3000/api/ocorrencias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao buscar dados");

      const oco = await response.json();

      campos.titulo.value = oco.titulo || "";
      campos.descricao.value = oco.descricao || "";
      campos.categoria.value = oco.categoria || "N/A";

      // PREENCHE COM A FORMATAÇÃO CORRETA DE MAIÚSCULAS/ACENTOS
      if (campos.setorOrigem) campos.setorOrigem.value = formatarSetor(oco.setorOrigem);
      if (campos.setorResponsavel) campos.setorResponsavel.value = formatarSetor(oco.setorResponsavel);

      campos.local.value = oco.local || "N/A";
      campos.urgencia.value = oco.urgencia || oco.prioridade || "N/A";
      campos.autor.value = oco.User ? oco.User.nome : "Desconhecido";
      campos.dataEnvio.value = new Date(oco.createdAt).toLocaleString("pt-BR");
      campos.status.value = oco.status || "Aberta";
      campos.prioridade.value = oco.prioridade || "baixa";

      if (oco.anexo) {
        campos.anexo.src = oco.anexo.startsWith("http")
          ? oco.anexo
          : `http://localhost:3000/uploads/${oco.anexo}`;
        campos.anexo.style.display = "block";
      } else {
        campos.anexo.style.display = "none";
      }

      if ((role === "gestor" || role === "admin") && oco.status === "Concluída" && btnReabrir) {
        btnReabrir.style.display = "inline-block";
      }
    } catch (erro) {
      console.error(erro);
      if (campos.mensagem) campos.mensagem.textContent = "Erro ao carregar detalhes.";
    }
  }

  if (campos.form)
    campos.form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (campos.mensagem) {
        campos.mensagem.textContent = "Salvando...";
        campos.mensagem.style.color = "blue";
      }

      if (role === "funcionario") return;

      const payload = {
        status: campos.status.value,
        prioridade: campos.prioridade.value,
        observacao: campos.observacao.value.trim(),
      };

      try {
        const response = await fetch(`http://localhost:3000/api/ocorrencias/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          if (campos.mensagem) {
            campos.mensagem.style.color = "green";
            campos.mensagem.textContent = "✅ Alterações salvas com sucesso!";
          }
        } else {
          throw new Error("Erro ao salvar.");
        }
      } catch (erro) {
        console.error(erro);
        if (campos.mensagem) {
          campos.mensagem.style.color = "red";
          campos.mensagem.textContent = "❌ Falha ao salvar alterações.";
        }
      }
    });

  if (btnPdf) btnPdf.addEventListener("click", () => window.print());

  montarMenu(role);
  aplicarPermissoes(role);
  if (id) carregarDadosReais();
});