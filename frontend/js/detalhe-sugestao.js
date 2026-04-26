document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const perfilSidebar = document.getElementById("perfil-sidebar");
    const ferramentas = document.getElementById("ferramentas");

    const blocoGestao = document.getElementById("bloco-gestao");
    const blocoParecer = document.getElementById("bloco-parecer");
    const btnSalvar = document.getElementById("btn-salvar");
    const btnPdf = document.getElementById("btn-pdf");

    const campos = {
        titulo: document.getElementById("titulo"),
        descricao: document.getElementById("descricao"),
        setorOrigem: document.getElementById("setor_origem"),
        beneficioEsperado: document.getElementById("beneficio_esperado"),
        autor: document.getElementById("autor"),
        dataEnvio: document.getElementById("data_envio"),
        votos: document.getElementById("votos"),
        status: document.getElementById("status"),
        parecerGestor: document.getElementById("parecer_gestor"),
        mensagem: document.getElementById("mensagem-sugestao"),
        form: document.getElementById("form-sugestao")
    };

    const usuarioString = localStorage.getItem("usuarioLogado");

    if (!usuarioString) {
        window.location.href = "./login.html";
        return;
    }

    const usuarioLogado = JSON.parse(usuarioString);

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
                    <i class="fa-solid fa-table-columns"></i>
                    <a href="./painel-solicitacoes-gestor.html">Solicitações</a>
                </div>
                <div class="link-menu">
                    <i class="fa-solid fa-chart-line"></i>
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

    const sugestao = {
        id: 9,
        titulo: "Melhorar iluminação do corredor",
        descricao: "Instalar mais pontos de luz no corredor lateral para aumentar a visibilidade e a segurança.",
        setor_origem: "Administrativo",
        beneficio_esperado: "Melhor visibilidade, mais conforto e mais segurança para circulação.",
        autor: "Mariana Alves",
        data_envio: "13/04/2026 às 10:40",
        votos: 12,
        status: "em_analise",
        parecer_gestor: "Sugestão em avaliação junto à equipe de infraestrutura."
    };

    function aplicarPermissoes(perfil) {
        if (perfil === "gestor") {
            campos.status.disabled = false;
            campos.parecerGestor.disabled = false;

            blocoGestao.style.display = "block";
            blocoParecer.style.display = "block";
            btnSalvar.style.display = "inline-block";
            return;
        }

        campos.status.disabled = true;
        campos.parecerGestor.disabled = true;

        blocoGestao.style.display = "none";
        blocoParecer.style.display = "none";
        btnSalvar.style.display = "none";
    }

    function preencherTela() {
        nomeSidebar.textContent = usuarioLogado.nome;

        campos.titulo.value = sugestao.titulo;
        campos.descricao.value = sugestao.descricao;
        campos.setorOrigem.value = sugestao.setor_origem;
        campos.beneficioEsperado.value = sugestao.beneficio_esperado;
        campos.autor.value = sugestao.autor;
        campos.dataEnvio.value = sugestao.data_envio;
        campos.votos.value = `${sugestao.votos} voto(s)`;
        campos.status.value = sugestao.status;
        campos.parecerGestor.value = sugestao.parecer_gestor;
    }

    function validarFormulario() {
        if (!campos.status.value) {
            campos.mensagem.textContent = "Selecione um status.";
            campos.mensagem.style.color = "#d62828";
            return false;
        }

        return true;
    }

    campos.form.addEventListener("submit", async (event) => {
        event.preventDefault();

        campos.mensagem.textContent = "";

        if (usuarioLogado.perfil !== "gestor") return;
        if (!validarFormulario()) return;

        const payload = {
            id: sugestao.id,
            status: campos.status.value,
            parecer_gestor: campos.parecerGestor.value.trim()
        };

        try {
            console.log("Enviando para backend:", payload);

            campos.mensagem.style.color = "green";
            campos.mensagem.textContent = "Alterações salvas com sucesso.";
        } catch (erro) {
            campos.mensagem.style.color = "#d62828";
            campos.mensagem.textContent = "Erro ao salvar alterações.";
            console.error(erro);
        }
    });

    btnPdf?.addEventListener("click", () => {
        window.print();
    });

    montarMenu(usuarioLogado.perfil);
    preencherTela();
    aplicarPermissoes(usuarioLogado.perfil);
});