document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const lista = document.getElementById("lista-solicitacoes");
    const listaAtribuicoes = document.getElementById("lista-atribuicoes");
    const filtros = document.querySelectorAll(".filtro");

    const usuarioString = localStorage.getItem("usuarioLogado");
    if (!usuarioString) {
        window.location.href = "./login.html";
        return;
    }

    const usuario = JSON.parse(usuarioString);

    const solicitacoesCriadas = [
        {
            id: 1,
            tipo: "ocorrencia",
            titulo: "Computador não liga",
            descricao: "Ao ligar o computador da sala 03 ele permanece com a tela preta.",
            status: "em_andamento",
            data: "13/04/2026",
            setor: "TI"
        },
        {
            id: 2,
            tipo: "sugestao",
            titulo: "Melhorar iluminação do corredor",
            descricao: "Seria interessante instalar novas lâmpadas no corredor principal.",
            status: "em_analise",
            data: "12/04/2026",
            setor: "Administrativo"
        },
        {
            id: 3,
            tipo: "ocorrencia",
            titulo: "Impressora travando",
            descricao: "A impressora do setor administrativo trava ao imprimir mais de 5 páginas.",
            status: "concluida",
            data: "10/04/2026",
            setor: "TI"
        },
        {
            id: 4,
            tipo: "sugestao",
            titulo: "Criar quadro de avisos",
            descricao: "Um quadro de avisos ajudaria na comunicação entre os funcionários.",
            status: "aprovada",
            data: "08/04/2026",
            setor: "Administrativo"
        }
    ];

    const ocorrenciasAtribuidas = [
        {
            id: 15,
            tipo: "ocorrencia",
            titulo: "Computador não liga",
            descricao: "O computador do RH parou de funcionar desde ontem.",
            status: "em_analise",
            prioridade: "alta",
            data: "13/04/2026",
            setor: "TI",
            autor: "Maria Oliveira"
        },
        {
            id: 16,
            tipo: "ocorrencia",
            titulo: "Impressora travando",
            descricao: "A impressora do setor administrativo trava ao imprimir.",
            status: "em_andamento",
            prioridade: "media",
            data: "12/04/2026",
            setor: "TI",
            autor: "João Pedro"
        }
    ];

    nomeSidebar.textContent = usuario.nome;

    function formatarStatus(status) {
        const mapa = {
            aberta: "Aberta",
            enviada: "Enviada",
            em_andamento: "Em andamento",
            em_analise: "Em análise",
            concluida: "Concluída",
            aprovada: "Aprovada",
            rejeitada: "Rejeitada"
        };

        return mapa[status] || status;
    }

    function formatarPrioridade(prioridade) {
        const mapa = {
            baixa: "Baixa",
            media: "Média",
            alta: "Alta",
            critica: "Crítica"
        };

        return mapa[prioridade] || prioridade;
    }

    function renderizarSolicitacoesCriadas(tipo = "todas") {
        lista.innerHTML = "";

        const filtradas = tipo === "todas"
            ? solicitacoesCriadas
            : solicitacoesCriadas.filter(item => item.tipo === tipo);

        if (filtradas.length === 0) {
            lista.innerHTML = `
                <div class="card-solicitacao">
                    <div class="info-solicitacao">
                        <h3>Nenhuma solicitação encontrada</h3>
                        <p>Não existem itens para este filtro.</p>
                    </div>
                </div>
            `;
            return;
        }

        filtradas.forEach((item) => {
            const card = document.createElement("article");
            card.className = `card-solicitacao ${item.tipo}`;

            const destino = item.tipo === "ocorrencia"
                ? `./detalhe-ocorrencia.html?id=${item.id}`
                : `./detalhe-sugestao.html?id=${item.id}`;

            card.innerHTML = `
                <div class="info-solicitacao">
                    <div class="tipo">
                        ${item.tipo === "ocorrencia" ? "Ocorrência" : "Sugestão"}
                    </div>

                    <h3>${item.titulo}</h3>

                    <p>${item.descricao}</p>

                    <div class="meta">
                        <span><strong>Setor:</strong> ${item.setor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        <span class="status ${item.status}">
                            ${formatarStatus(item.status)}
                        </span>
                    </div>
                </div>

                <div class="acoes">
                    <a href="${destino}" class="btn-detalhes">
                        Ver detalhes
                    </a>
                </div>
            `;

            lista.appendChild(card);
        });
    }

// Atualizamos a função para receber o filtro (igual à lista de cima)
    function renderizarAtribuicoes(tipo = "todas") {
        listaAtribuicoes.innerHTML = "";

        // Aplica o filtro na lista de ocorrências atribuídas
        const filtradas = tipo === "todas"
            ? ocorrenciasAtribuidas
            : ocorrenciasAtribuidas.filter(item => item.tipo === tipo);

        // Se o filtro for "sugestões", a lista de ocorrências atribuídas fica vazia e mostra o aviso
        if (filtradas.length === 0) {
            listaAtribuicoes.innerHTML = `
                <div class="card-solicitacao">
                    <div class="info-solicitacao">
                        <h3>Nenhuma ocorrência atribuída</h3>
                        <p>Não existem itens atribuídos para este filtro.</p>
                    </div>
                </div>
            `;
            return;
        }

        filtradas.forEach((item) => {
            const card = document.createElement("article");
            card.className = "card-solicitacao ocorrencia atribuida";

            const destino = `./detalhe-ocorrencia.html?id=${item.id}`;

            card.innerHTML = `
                <div class="info-solicitacao">
                    <div class="tipo">
                        Ocorrência atribuída
                    </div>

                    <h3>${item.titulo}</h3>

                    <p>${item.descricao}</p>

                    <div class="meta">
                        <span><strong>Setor:</strong> ${item.setor}</span>
                        <span><strong>Autor:</strong> ${item.autor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        <span><strong>Prioridade:</strong> ${formatarPrioridade(item.prioridade)}</span>
                        <span class="status ${item.status}">
                            ${formatarStatus(item.status)}
                        </span>
                    </div>
                </div>

                <div class="acoes">
                    <a href="${destino}" class="btn-detalhes">
                        Ver detalhes
                    </a>
                </div>
            `;

            listaAtribuicoes.appendChild(card);
        });
    }

    // Atualizamos os botões para mandarem o comando para as DUAS listas
    filtros.forEach((botao) => {
        botao.addEventListener("click", () => {
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");

            const filtroEscolhido = botao.dataset.filtro;
            
            // Agora o filtro afeta ambas as secções!
            renderizarSolicitacoesCriadas(filtroEscolhido);
            renderizarAtribuicoes(filtroEscolhido);
        });
    });

    renderizarSolicitacoesCriadas();
    renderizarAtribuicoes();
});