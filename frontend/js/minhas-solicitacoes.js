document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token || role !== "funcionario") {
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const nomeSidebar = document.getElementById("nome-sidebar");
    if (nomeSidebar && nome) nomeSidebar.textContent = nome;

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    const lista = document.getElementById("lista-solicitacoes");
    const listaAtribuicoes = document.getElementById("lista-atribuicoes");
    const filtros = document.querySelectorAll(".filtro");

    let solicitacoesCriadas = [];
    let ocorrenciasAtribuidas = [];

    // ==========================================
    // BUSCAR DADOS REAIS USANDO AS ROTAS /MINHAS
    // ==========================================
    async function carregarMinhasSolicitacoes() {
        try {
            const headers = { "Authorization": `Bearer ${token}` };

            // Chamada para as rotas do backend que já filtram pelo UserId do token
            const [resOco, resSug] = await Promise.all([
                fetch("http://localhost:3000/api/ocorrencias/minhas", { headers }),
                fetch("http://localhost:3000/api/sugestoes/minhas", { headers })
            ]);

            const ocorrenciasDB = resOco.ok ? await resOco.json() : [];
            const sugestoesDB = resSug.ok ? await resSug.json() : [];

            // Mapeia as Ocorrências (seguindo o modelo do banco)
            const minhasOcorrencias = ocorrenciasDB.map(oco => ({
                id: oco.id, 
                tipo: "ocorrencia", 
                titulo: oco.titulo, 
                descricao: oco.descricao,
                status: oco.status || "Aberta", 
                prioridade: oco.prioridade || "baixa",
                data: new Date(oco.createdAt).toLocaleDateString('pt-BR'),
                setor: oco.setorResponsavel || oco.setorOrigem || "N/A"
            }));

            // Mapeia as Sugestões (seguindo o modelo do banco)
            const minhasSugestoes = sugestoesDB.map(sug => ({
                id: sug.id, 
                tipo: "sugestao", 
                titulo: sug.titulo, 
                descricao: sug.descricao,
                status: sug.status || "Enviada", 
                data: new Date(sug.createdAt).toLocaleDateString('pt-BR'),
                setor: sug.setor || "N/A"
            }));

            solicitacoesCriadas = [...minhasOcorrencias, ...minhasSugestoes];
            
            // Caso existam ocorrências atribuídas (lógica futura de responsabilidade)
            // Por enquanto, buscamos ocorrências gerais que possam estar ligadas ao seu nome se necessário
            ocorrenciasAtribuidas = []; 

            renderizarSolicitacoesCriadas("todas");
            renderizarAtribuicoes("todas");

        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
            if(lista) lista.innerHTML = `<div class="card-solicitacao"><h3>Erro de conexão</h3><p>Verifique se o backend está rodando.</p></div>`;
        }
    }

    function formatarStatus(status) {
        // Mapa ajustado para aceitar as letras maiúsculas que vêm do banco
        const mapa = { 
            "Aberta": "Aberta", 
            "Enviada": "Enviada", 
            "Em andamento": "Em andamento", 
            "Em análise": "Em análise", 
            "Concluída": "Concluída", 
            "Aprovada": "Aprovada", 
            "Rejeitada": "Rejeitada" 
        };
        return mapa[status] || status;
    }

    function formatarPrioridade(prioridade) {
        const mapa = { 
            "baixa": "Baixa", 
            "média": "Média", 
            "alta": "Alta", 
            "crítica": "Crítica" 
        };
        return mapa[prioridade] || prioridade;
    }

    function renderizarSolicitacoesCriadas(tipo = "todas") {
        if(!lista) return;
        lista.innerHTML = "";
        
        const filtradas = tipo === "todas" 
            ? solicitacoesCriadas 
            : solicitacoesCriadas.filter(item => item.tipo === tipo);

        if (filtradas.length === 0) {
            lista.innerHTML = `
                <div class="card-solicitacao">
                    <div class="info-solicitacao">
                        <h3>Nenhuma solicitação encontrada</h3>
                        <p>Você ainda não registrou itens deste tipo.</p>
                    </div>
                </div>`;
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
                    <div class="tipo">${item.tipo === "ocorrencia" ? "Ocorrência" : "Sugestão"}</div>
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                    <div class="meta">
                        <span><strong>Setor:</strong> ${item.setor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        <span class="status ${item.status.toLowerCase().replace(/ /g, '-')}">${formatarStatus(item.status)}</span>
                    </div>
                </div>
                <div class="acoes"><a href="${destino}" class="btn-detalhes">Ver detalhes</a></div>
            `;
            lista.appendChild(card);
        });
    }

    function renderizarAtribuicoes(tipo = "todas") {
        if(!listaAtribuicoes) return;
        listaAtribuicoes.innerHTML = "";
        
        const filtradas = tipo === "todas" || tipo === "ocorrencia" 
            ? ocorrenciasAtribuidas 
            : [];

        if (filtradas.length === 0) {
            listaAtribuicoes.innerHTML = `
                <div class="card-solicitacao">
                    <div class="info-solicitacao">
                        <h3>Nenhuma ocorrência atribuída</h3>
                        <p>Você não é o responsável atual por nenhuma ocorrência.</p>
                    </div>
                </div>`;
            return;
        }

        filtradas.forEach((item) => {
            const card = document.createElement("article");
            card.className = "card-solicitacao ocorrencia atribuida";
            card.innerHTML = `
                <div class="info-solicitacao">
                    <div class="tipo">Ocorrência atribuída</div>
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                    <div class="meta">
                        <span><strong>Setor:</strong> ${item.setor}</span>
                        <span><strong>Autor:</strong> ${item.autor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        <span><strong>Prioridade:</strong> ${formatarPrioridade(item.prioridade)}</span>
                        <span class="status ${item.status.toLowerCase().replace(/ /g, '-')}">${formatarStatus(item.status)}</span>
                    </div>
                </div>
                <div class="acoes"><a href="./detalhe-ocorrencia.html?id=${item.id}" class="btn-detalhes">Ver detalhes</a></div>
            `;
            listaAtribuicoes.appendChild(card);
        });
    }

    filtros.forEach((botao) => {
        botao.addEventListener("click", () => {
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");
            const filtroEscolhido = botao.dataset.filtro;
            renderizarSolicitacoesCriadas(filtroEscolhido);
            renderizarAtribuicoes(filtroEscolhido);
        });
    });

    carregarMinhasSolicitacoes();
});