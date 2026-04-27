document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. PORTEIRO DE SEGURANÇA E LOGOUT
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token || role !== "gestor") {
        localStorage.clear();
        window.location.href = "./login.html";
        return; // Pára a execução
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

    // ==========================================
    // 2. LÓGICA DA PÁGINA
    // ==========================================
    const params = new URLSearchParams(window.location.search);
    const prioridadeUrl = params.get("prioridade");
    const statusUrl = params.get("status");
    const tipoUrl = params.get("tipo");

    const lista = document.getElementById("lista-solicitacoes");
    const filtros = document.querySelectorAll(".filtro");
    const inputBusca = document.getElementById("input-busca");

    const totalItens = document.getElementById("total-itens");
    const totalOcorrencias = document.getElementById("total-ocorrencias");
    const totalSugestoes = document.getElementById("total-sugestoes");
    const totalEmAnalise = document.getElementById("total-em-analise");

    let solicitacoes = [];
    let filtroAtual = "todas";

    if (tipoUrl === "ocorrencia" || tipoUrl === "sugestao") {
        filtroAtual = tipoUrl;
    }

    async function carregarDadosDoBanco() {
        try {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            const [respostaOcorrencias, respostaSugestoes] = await Promise.all([
                fetch("http://localhost:3000/api/ocorrencias", { headers }),
                fetch("http://localhost:3000/api/sugestoes", { headers })
            ]);

            let ocorrenciasDB = respostaOcorrencias.ok ? await respostaOcorrencias.json() : [];
            let sugestoesDB = respostaSugestoes.ok ? await respostaSugestoes.json() : [];

            const ocorrenciasFormatadas = ocorrenciasDB.map(oco => ({
                id: oco.id, tipo: "ocorrencia", titulo: oco.titulo, descricao: oco.descricao,
                status: oco.status || "em_analise", prioridade: oco.prioridade || "media",
                data: new Date(oco.createdAt).toLocaleDateString('pt-BR'),
                setor_origem: oco.setorOrigem || "N/A", setor_responsavel: oco.setorResponsavel || "N/A",
                autor: oco.User ? oco.User.nome : "Desconhecido", matricula: oco.User ? oco.User.id : "N/A"
            }));

            const sugestoesFormatadas = sugestoesDB.map(sug => ({
                id: sug.id, tipo: "sugestao", titulo: sug.titulo, descricao: sug.descricao,
                status: sug.status || "em_analise", data: new Date(sug.createdAt).toLocaleDateString('pt-BR'),
                setor_origem: sug.setorOrigem || "N/A", setor_responsavel: sug.setorResponsavel || "N/A",
                autor: sug.User ? sug.User.nome : "Desconhecido", matricula: sug.User ? sug.User.id : "N/A"
            }));

            solicitacoes = [...ocorrenciasFormatadas, ...sugestoesFormatadas];

            atualizarResumo();
            aplicarFiltroVisualInicial();
            renderizar();

        } catch (erro) {
            console.error("Erro de conexão:", erro);
            if(lista) lista.innerHTML = `<div class="card-vazia"><h3>Erro</h3><p>Não foi possível carregar os dados.</p></div>`;
        }
    }

    function formatarStatus(status) {
        const mapa = { aberta: "Aberta", enviada: "Enviada", em_analise: "Em análise", em_andamento: "Em andamento", concluida: "Concluída", aprovada: "Aprovada", rejeitada: "Rejeitada" };
        return mapa[status] || status;
    }

    function formatarPrioridade(prioridade) {
        const mapa = { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" };
        return mapa[prioridade] || prioridade;
    }

    function atualizarResumo() {
        if(totalItens) totalItens.textContent = solicitacoes.length;
        if(totalOcorrencias) totalOcorrencias.textContent = solicitacoes.filter(item => item.tipo === "ocorrencia").length;
        if(totalSugestoes) totalSugestoes.textContent = solicitacoes.filter(item => item.tipo === "sugestao").length;
        if(totalEmAnalise) totalEmAnalise.textContent = solicitacoes.filter(item => item.status === "em_analise").length;
    }

    function filtrarSolicitacoes() {
        const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : "";
        return solicitacoes.filter((item) => {
            const bateFiltroTipo = filtroAtual === "todas" || item.tipo === filtroAtual;
            const bateFiltroPrioridade = !prioridadeUrl || (item.tipo === "ocorrencia" && item.prioridade === prioridadeUrl);
            const bateFiltroStatus = !statusUrl || item.status === statusUrl;
            const textoCompleto = `${item.titulo} ${item.descricao} ${item.setor_origem} ${item.setor_responsavel} ${item.autor} ${item.matricula} ${item.status||""} ${item.prioridade||""}`.toLowerCase();
            return bateFiltroTipo && bateFiltroPrioridade && bateFiltroStatus && textoCompleto.includes(termo);
        });
    }

    function renderizar() {
        if (!lista) return;
        lista.innerHTML = "";
        const itens = filtrarSolicitacoes();

        if (itens.length === 0) {
            lista.innerHTML = `<div class="card-vazia"><h3>Sem resultados</h3></div>`;
            return;
        }

        itens.forEach((item) => {
            const card = document.createElement("article");
            card.className = `card-solicitacao ${item.tipo}`;
            const destino = item.tipo === "ocorrencia" ? `./detalhe-ocorrencia.html?id=${item.id}` : `./detalhe-sugestao.html?id=${item.id}`;

            card.innerHTML = `
                <div class="info-solicitacao">
                    <div class="tipo">${item.tipo === "ocorrencia" ? "Ocorrência" : "Sugestão"}</div>
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                    <div class="meta">
                        <span><strong>Autor:</strong> ${item.autor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        ${item.tipo === "ocorrencia" && item.prioridade ? `<span><strong>Prioridade:</strong> ${formatarPrioridade(item.prioridade)}</span>` : ""}
                        <span class="status ${item.status}">${formatarStatus(item.status)}</span>
                    </div>
                </div>
                <div class="acoes">
                    <a href="${destino}" class="btn-detalhes">Ver detalhes</a>
                </div>
            `;
            lista.appendChild(card);
        });
    }

    function aplicarFiltroVisualInicial() {
        filtros.forEach(btn => btn.classList.remove("ativo"));
        const btnFiltro = [...filtros].find(btn => btn.dataset.filtro === filtroAtual) || [...filtros].find(btn => btn.dataset.filtro === "todas");
        if(btnFiltro) btnFiltro.classList.add("ativo");
    }

    filtros.forEach(botao => {
        botao.addEventListener("click", () => {
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");
            filtroAtual = botao.dataset.filtro;
            renderizar();
        });
    });

    if (inputBusca) inputBusca.addEventListener("input", renderizar);

    carregarDadosDoBanco();
});