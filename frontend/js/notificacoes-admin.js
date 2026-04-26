document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const resumoNaoLidas = document.getElementById("resumo-nao-lidas");
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");
    const listaNotificacoes = document.getElementById("lista-notificacoes");

    // --- NOVO SISTEMA DE VERIFICAÇÃO COM TOKEN ---
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");

    if (!token) {
        window.location.href = "login.html";
        return; // Pára o script
    }

    if (nomeSidebar) nomeSidebar.textContent = nome || "Administrador";
    // ----------------------------------------------

    // MOCK DATA: Notificações Falsas (Serão buscadas no backend futuramente)
    const notificacoesMock = [
        {
            id: 1,
            tipo: "usuario",
            titulo: "Novo usuário cadastrado",
            mensagem: 'O usuário <strong>"Mariana Alves"</strong> foi cadastrado com perfil de <strong>Funcionário</strong> no setor <strong>Administrativo</strong>.',
            data: "13/04/2026 - 09:00",
            lida: false,
            link: "./cadastro-usuario.html",
            icone: "fa-user-plus"
        },
        {
            id: 2,
            tipo: "ocorrencia",
            titulo: "Nova ocorrência registrada",
            mensagem: 'Foi registrada a ocorrência <strong>"Computador não liga"</strong> com setor de origem <strong>RH</strong> e setor responsável <strong>TI</strong>.',
            data: "13/04/2026 - 09:20",
            lida: false,
            link: "./detalhe-ocorrencia.html",
            icone: "fa-triangle-exclamation"
        },
        {
            id: 3,
            tipo: "sugestao",
            titulo: "Nova sugestão enviada",
            mensagem: 'A sugestão <strong>"Melhorar iluminação do corredor"</strong> foi enviada para o setor <strong>Administrativo</strong>.',
            data: "13/04/2026 - 10:40",
            lida: false,
            link: "./detalhe-sugestao.html",
            icone: "fa-lightbulb"
        }
    ];

    function atualizarResumo() {
        if (!resumoNaoLidas) return;
        const totalNaoLidas = notificacoesMock.filter(n => !n.lida).length;
        resumoNaoLidas.textContent = `Você tem ${totalNaoLidas} notificação(ões) não lida(s)`;
    }

    function renderizarNotificacoes() {
        if (!listaNotificacoes) return;
        listaNotificacoes.innerHTML = "";

        notificacoesMock.forEach((notificacao) => {
            const article = document.createElement("article");
            article.className = `card-notificacao ${notificacao.lida ? "lida" : "nao-lida"} ${notificacao.tipo}`;

            article.innerHTML = `
                <div class="icone-notificacao">
                    <i class="fa-solid ${notificacao.icone}"></i>
                </div>
                <div class="conteudo-notificacao">
                    <div class="linha-topo">
                        <span class="tipo">${notificacao.titulo}</span>
                        <span class="data">${notificacao.data}</span>
                    </div>
                    <p>${notificacao.mensagem}</p>
                    <a href="${notificacao.link}" class="btn-detalhes" data-id="${notificacao.id}">
                        Ver detalhes
                    </a>
                </div>
            `;

            listaNotificacoes.appendChild(article);
        });

        atualizarResumo();
        adicionarEventosDetalhes();
    }

    function adicionarEventosDetalhes() {
        const links = document.querySelectorAll(".btn-detalhes");

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const id = Number(event.target.dataset.id);
                const notificacao = notificacoesMock.find(n => n.id === id);

                if (notificacao) {
                    notificacao.lida = true;
                    atualizarResumo();
                }
            });
        });
    }

    if (btnMarcarLidas) {
        btnMarcarLidas.addEventListener("click", () => {
            notificacoesMock.forEach((n) => n.lida = true);
            renderizarNotificacoes();
        });
    }

    renderizarNotificacoes();
});