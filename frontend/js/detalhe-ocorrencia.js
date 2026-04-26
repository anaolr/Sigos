document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const perfilSidebar = document.getElementById("perfil-sidebar");
    const ferramentas = document.getElementById("ferramentas");

    const blocoGestao = document.getElementById("bloco-gestao");
    const blocoResponsavel = document.getElementById("bloco-responsavel");
    const blocoObservacao = document.getElementById("bloco-observacao");
    const btnSalvar = document.getElementById("btn-salvar");

    const btnReabrir = document.getElementById("btn-reabrir");
    const btnPdf = document.getElementById("btn-pdf");
    const modalReabrir = document.getElementById("modal-reabrir");
    const btnCancelarReabrir = document.getElementById("btn-cancelar-reabrir");
    const btnConfirmarReabrir = document.getElementById("btn-confirmar-reabrir");
    const motivoReabertura = document.getElementById("motivo_reabertura");

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
        form: document.getElementById("form-ocorrencia")
    };

    const usuarioString = localStorage.getItem("usuarioLogado");
    if (!usuarioString) {
        window.location.href = "./login.html";
        return;
    }

    const usuarioLogado = JSON.parse(usuarioString);

    const ocorrenciasMock = [
        {
            id: 15,
            titulo: "Computador não liga",
            descricao: "O computador do RH parou de funcionar desde ontem.",
            categoria: "Tecnologia",
            setor_origem: "RH",
            setor_responsavel: "TI",
            local: "Sala 03 - RH",
            urgencia: "Alta",
            autor: "Maria Oliveira",
            data_envio: "13/04/2026 às 09:15",
            anexo: "../imagens/exemplo-ocorrencia.jpg",
            status: "em_analise",
            prioridade: "alta",
            responsavel_atual: "João da Silva - Suporte",
            observacao_gestor: "Chamado encaminhado para a equipe técnica."
        },
        {
            id: 16,
            titulo: "Fio exposto no corredor",
            descricao: "Foi identificado um fio exposto próximo à porta principal.",
            categoria: "Segurança",
            setor_origem: "Almoxarifado",
            setor_responsavel: "Manutenção",
            local: "Corredor principal",
            urgencia: "Alta",
            autor: "Ana Souza",
            data_envio: "09/04/2026 às 14:20",
            anexo: "../imagens/exemplo-ocorrencia.jpg",
            status: "concluida",
            prioridade: "critica",
            responsavel_atual: "Ana Lopes - Supervisora",
            observacao_gestor: "Ocorrência finalizada após correção elétrica."
        }
    ];

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id")) || 15;

    const ocorrencia = ocorrenciasMock.find(item => item.id === id);

    function montarMenu(perfil) {
        nomeSidebar.textContent = usuarioLogado.nome;

        if (perfil === "funcionario") {
            perfilSidebar.textContent = "Funcionário";
            ferramentas.innerHTML = `
                <div class="link-menu">
                    <i class="fa-solid fa-house"></i>
                    <a href="./dashboard-funcionario.html">Início</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <a href="./nova-ocorrencia.html">Nova ocorrência</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-lightbulb"></i>
                    <a href="./nova-sugestao.html">Nova sugestão</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-folder-open"></i>
                    <a href="./minhas-solicitacoes.html">Minhas solicitações</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-user"></i>
                    <a href="./perfil-funcionario.html">Perfil</a>
                </div>
            `;
        }

        if (perfil === "gestor") {
            perfilSidebar.textContent = "Gestor";
            ferramentas.innerHTML = `
                <div class="link-menu">
                    <i class="fa-solid fa-user"></i>
                    <a href="./perfil-gestor.html">Perfil</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-folder-open"></i>
                    <a href="./painel-solicitacoes-gestor.html">Solicitações</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-table-columns"></i>
                    <a href="./dashboard-gestor.html">Dashboard</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-bell"></i>
                    <a href="./notificacoes.html">Notificações</a>
                </div>
            `;
        }

        if (perfil === "admin") {
            perfilSidebar.textContent = "Administrador";
            ferramentas.innerHTML = `
                <div class="link-menu">
                    <i class="fa-solid fa-user"></i>
                    <a href="./perfil-admin.html">Perfil</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-user-plus"></i>
                    <a href="./cadastro-usuario.html">Cadastro</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-chart-line"></i>
                    <a href="./dashboard-admin.html">Dashboard</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-bell"></i>
                    <a href="./notificacoes-admin.html">Notificações</a>
                </div>
            `;
        }
    }

    function aplicarPermissoes(perfil) {
        if (perfil === "gestor") {
            campos.status.disabled = false;
            campos.prioridade.disabled = false;
            campos.responsavelOcorrencia.disabled = false;
            campos.observacao.disabled = false;

            blocoGestao.style.display = "grid";
            blocoResponsavel.style.display = "block";
            blocoObservacao.style.display = "block";
            btnSalvar.style.display = "inline-block";

            return;
        }

        campos.status.disabled = true;
        campos.prioridade.disabled = true;
        campos.responsavelOcorrencia.disabled = true;
        campos.observacao.disabled = true;

        blocoGestao.style.display = "none";
        blocoResponsavel.style.display = "none";
        blocoObservacao.style.display = "none";
        btnSalvar.style.display = "none";
        btnReabrir.style.display = "none";
    }

    function preencherTela() {
        if (!ocorrencia) {
            campos.mensagem.textContent = "Ocorrência não encontrada.";
            campos.mensagem.style.color = "#d62828";
            return;
        }

        campos.titulo.value = ocorrencia.titulo;
        campos.descricao.value = ocorrencia.descricao;
        campos.categoria.value = ocorrencia.categoria;
        campos.setorOrigem.value = ocorrencia.setor_origem;
        campos.setorResponsavel.value = ocorrencia.setor_responsavel;
        campos.local.value = ocorrencia.local;
        campos.urgencia.value = ocorrencia.urgencia;
        campos.autor.value = ocorrencia.autor;
        campos.dataEnvio.value = ocorrencia.data_envio;
        campos.status.value = ocorrencia.status;
        campos.prioridade.value = ocorrencia.prioridade;
        campos.responsavelAtual.value =
            ocorrencia.responsavel_atual || "Nenhum responsável definido";
        campos.observacao.value = ocorrencia.observacao_gestor || "";

        if (ocorrencia.anexo) {
            campos.anexo.src = ocorrencia.anexo;
            campos.anexo.style.display = "block";
        } else {
            campos.anexo.style.display = "none";
        }

        if (usuarioLogado.perfil === "gestor" && ocorrencia.status === "concluida") {
            btnReabrir.style.display = "inline-block";
        } else {
            btnReabrir.style.display = "none";
        }
    }

    function validarFormulario() {
        if (usuarioLogado.perfil !== "gestor") return false;

        if (!campos.status.value) {
            campos.mensagem.style.color = "#d62828";
            campos.mensagem.textContent = "Selecione um status.";
            return false;
        }

        if (!campos.prioridade.value) {
            campos.mensagem.style.color = "#d62828";
            campos.mensagem.textContent = "Selecione uma prioridade.";
            return false;
        }

        return true;
    }

    campos.form.addEventListener("submit", (event) => {
        event.preventDefault();

        campos.mensagem.textContent = "";

        if (usuarioLogado.perfil !== "gestor") return;
        if (!validarFormulario()) return;

        const responsavelSelecionado =
            campos.responsavelOcorrencia.options[
                campos.responsavelOcorrencia.selectedIndex
            ]?.text || "";

        const payload = {
            id: ocorrencia.id,
            status: campos.status.value,
            prioridade: campos.prioridade.value,
            responsavel: campos.responsavelOcorrencia.value
                ? responsavelSelecionado
                : campos.responsavelAtual.value,
            observacao_gestor: campos.observacao.value.trim()
        };

        if (campos.responsavelOcorrencia.value) {
            campos.responsavelAtual.value = responsavelSelecionado;
        }

        console.log("Enviando para backend:", payload);

        campos.mensagem.style.color = "green";
        campos.mensagem.textContent = "Alterações salvas com sucesso.";

        if (campos.status.value === "concluida") {
            btnReabrir.style.display = "inline-block";
        }
    });

    btnReabrir?.addEventListener("click", () => {
        modalReabrir.classList.add("ativo");
    });

    btnCancelarReabrir?.addEventListener("click", () => {
        modalReabrir.classList.remove("ativo");
        motivoReabertura.value = "";
    });

    btnConfirmarReabrir?.addEventListener("click", () => {
        if (!motivoReabertura.value.trim()) {
            campos.mensagem.style.color = "#d62828";
            campos.mensagem.textContent = "Informe o motivo da reabertura.";
            return;
        }

        campos.status.value = "em_analise";
        ocorrencia.status = "em_analise";

        console.log("Reabertura:", {
            id: ocorrencia.id,
            novo_status: "em_analise",
            motivo: motivoReabertura.value.trim()
        });

        campos.mensagem.style.color = "green";
        campos.mensagem.textContent = "Ocorrência reaberta com sucesso.";

        modalReabrir.classList.remove("ativo");
        motivoReabertura.value = "";
        btnReabrir.style.display = "none";
    });

    btnPdf?.addEventListener("click", () => {
        window.print();
    });

    montarMenu(usuarioLogado.perfil);
    preencherTela();
    aplicarPermissoes(usuarioLogado.perfil);
});