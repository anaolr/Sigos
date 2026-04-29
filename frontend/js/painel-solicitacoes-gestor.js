// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "gestor") {
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    const params = new URLSearchParams(window.location.search);
    const prioridadeUrl = params.get("prioridade");
    const statusUrl = params.get("status");
    const tipoUrl = params.get("tipo");

    // ==========================================
    // TRADUTOR DA URL PARA O BANCO DE DADOS
    // ==========================================
    const mapaStatus = {
        "aberta": "Aberta",
        "enviada": "Enviada",
        "em_analise": "Em análise",
        "em_andamento": "Em andamento",
        "concluida": "Concluída",
        "aprovada": "Aprovada",
        "rejeitada": "Rejeitada"
    };

    const mapaPrioridade = {
        "baixa": "baixa",
        "media": "média",
        "alta": "alta",
        "critica": "crítica"
    };

    const statusBuscado = statusUrl ? mapaStatus[statusUrl] : null;
    const prioridadeBuscada = prioridadeUrl ? mapaPrioridade[prioridadeUrl] : null;

    const nomeSidebar = document.getElementById("nome-sidebar");
    const lista = document.getElementById("lista-solicitacoes");
    const filtros = document.querySelectorAll(".filtro");
    const inputBusca = document.getElementById("input-busca");

    const totalItens = document.getElementById("total-itens");
    const totalOcorrencias = document.getElementById("total-ocorrencias");
    const totalSugestoes = document.getElementById("total-sugestoes");
    const totalEmAnalise = document.getElementById("total-em-analise");

    let solicitacoes = [];
    let filtroAtual = (tipoUrl === "ocorrencia" || tipoUrl === "sugestao") ? tipoUrl : "todas";

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

    async function carregarDadosDoBanco() {
        try {
            const resPerfil = await fetch(`${API_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resPerfil.ok) throw new Error("Falha ao buscar perfil.");
            const gestor = await resPerfil.json();
            if (nomeSidebar) nomeSidebar.textContent = gestor.nome;
            const setorGestor = gestor.setor || "";

            const [respostaOcorrencias, respostaSugestoes] = await Promise.all([
                fetch(`${API_URL}/api/ocorrencias/todas`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/sugestoes/todas`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const ocorrenciasDB = respostaOcorrencias.ok ? await respostaOcorrencias.json() : [];
            const sugestoesDB = respostaSugestoes.ok ? await respostaSugestoes.json() : [];

            const ocorrenciasFormatadas = ocorrenciasDB
                .filter(oco => {
                    if (!setorGestor || !oco.setorResponsavel) return false; 
                    return oco.setorResponsavel.toLowerCase() === setorGestor.toLowerCase();
                })
                .map(oco => ({
                    id: oco.id, tipo: "ocorrencia", titulo: oco.titulo, descricao: oco.descricao,
                    status: oco.status || "Aberta", prioridade: oco.prioridade || "baixa",
                    data: new Date(oco.createdAt).toLocaleDateString('pt-BR'),
                    setor_origem: formatarSetor(oco.setorOrigem), 
                    setor_responsavel: formatarSetor(oco.setorResponsavel),
                    autor: oco.User ? oco.User.nome : "Desconhecido", matricula: oco.User ? oco.User.id : "N/A"
                }));

            const sugestoesFormatadas = sugestoesDB
                .filter(sug => sug.setor && sug.setor.toLowerCase() === setorGestor.toLowerCase())
                .map(sug => ({
                    id: sug.id, tipo: "sugestao", titulo: sug.titulo, descricao: sug.descricao,
                    status: sug.status || "Enviada", data: new Date(sug.createdAt).toLocaleDateString('pt-BR'),
                    setor_origem: formatarSetor(sug.User?.setor),
                    setor_responsavel: formatarSetor(sug.setor),
                    autor: sug.User ? sug.User.nome : "Desconhecido", matricula: sug.User ? sug.User.id : "N/A"
                }));

            solicitacoes = [...ocorrenciasFormatadas, ...sugestoesFormatadas];

            atualizarResumo();
            aplicarFiltroVisualInicial();
            renderizar();

        } catch (erro) {
            console.error("Erro:", erro);
            if(lista) lista.innerHTML = `<div class="card-vazia"><h3>Erro</h3><p>Não foi possível carregar os dados.</p></div>`;
        }
    }

    function formatarStatus(status) {
        const mapa = { "Aberta": "Aberta", "Enviada": "Enviada", "Em análise": "Em análise", "Em andamento": "Em andamento", "Concluída": "Concluída", "Aprovada": "Aprovada", "Rejeitada": "Rejeitada" };
        return mapa[status] || status;
    }

    function formatarPrioridade(prioridade) {
        const mapa = { baixa: "Baixa", "média": "Média", alta: "Alta", "crítica": "Crítica" };
        return mapa[prioridade] || prioridade;
    }

    function atualizarResumo() {
        if(totalItens) totalItens.textContent = solicitacoes.length;
        if(totalOcorrencias) totalOcorrencias.textContent = solicitacoes.filter(item => item.tipo === "ocorrencia").length;
        if(totalSugestoes) totalSugestoes.textContent = solicitacoes.filter(item => item.tipo === "sugestao").length;
        if(totalEmAnalise) totalEmAnalise.textContent = solicitacoes.filter(item => item.status === "Em análise" || item.status === "Aberta").length;
    }

    function filtrarSolicitacoes() {
        const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : "";
        
        return solicitacoes.filter((item) => {
            const bateFiltroTipo = filtroAtual === "todas" || item.tipo === filtroAtual;
            
            // Verifica a prioridade com o tradutor
            const bateFiltroPrioridade = !prioridadeBuscada || (item.prioridade === prioridadeBuscada) || (prioridadeUrl === "alta" && item.prioridade === "crítica");
            
            // Verifica o status com o tradutor
            const bateFiltroStatus = !statusBuscado || item.status === statusBuscado;
            
            const textoCompleto = `${item.titulo} ${item.descricao} ${item.setor_origem} ${item.autor} ${item.matricula} ${item.status||""} ${item.prioridade||""}`.toLowerCase();
            return bateFiltroTipo && bateFiltroStatus && bateFiltroPrioridade && textoCompleto.includes(termo);
        });
    }

    function renderizar() {
        if (!lista) return;
        lista.innerHTML = "";
        const itens = filtrarSolicitacoes();

        if (itens.length === 0) {
            lista.innerHTML = `<div class="card-vazia"><h3>Nenhum resultado</h3><p>Não há solicitações para o seu setor com estes filtros.</p></div>`;
            return;
        }

        itens.forEach((item) => {
            const card = document.createElement("article");
            card.className = `card-solicitacao ${item.tipo}`;
            const destino = item.tipo === "ocorrencia" ? `./detalhe-ocorrencia.html?id=${item.id}` : `./detalhe-sugestao.html?id=${item.id}`;
            const classStatus = item.status.toLowerCase().replace(/ /g, '-').replace('á', 'a').replace('í', 'i');

            card.innerHTML = `
                <div class="info-solicitacao">
                    <div class="tipo">${item.tipo === "ocorrencia" ? "Ocorrência" : "Sugestão"}</div>
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                    <div class="meta">
                        <span><strong>Autor:</strong> ${item.autor}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        <span><strong>Origem:</strong> ${item.setor_origem}</span>
                        ${item.tipo === "ocorrencia" && item.prioridade ? `<span><strong>Prioridade:</strong> ${formatarPrioridade(item.prioridade)}</span>` : ""}
                        <span class="status ${classStatus}">${formatarStatus(item.status)}</span>
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