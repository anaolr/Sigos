document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const prioridadeUrl = params.get("prioridade");
    const statusUrl = params.get("status");
    const tipoUrl = params.get("tipo");

    const nomeSidebar = document.getElementById("nome-sidebar");
    const lista = document.getElementById("lista-solicitacoes");
    const filtros = document.querySelectorAll(".filtro");
    const inputBusca = document.getElementById("input-busca");

    const totalItens = document.getElementById("total-itens");
    const totalOcorrencias = document.getElementById("total-ocorrencias");
    const totalSugestoes = document.getElementById("total-sugestoes");
    const totalEmAnalise = document.getElementById("total-em-analise");

    const usuarioString = localStorage.getItem("usuarioLogado");
    if (!usuarioString) {
        window.location.href = "./login.html";
        return;
    }

    const gestor = JSON.parse(usuarioString);

    const solicitacoes = [
        {
            id: 1,
            tipo: "ocorrencia",
            titulo: "Computador não liga",
            descricao: "O computador do RH não liga desde ontem.",
            status: "em_analise",
            prioridade: "alta",
            data: "13/04/2026",
            setor_origem: "RH",
            setor_responsavel: "TI",
            autor: "Maria Oliveira",
            matricula: "2024015"
        },
        {
            id: 2,
            tipo: "ocorrencia",
            titulo: "Impressora travando",
            descricao: "A impressora do setor administrativo está travando com frequência.",
            status: "em_andamento",
            prioridade: "media",
            data: "12/04/2026",
            setor_origem: "Administrativo",
            setor_responsavel: "TI",
            autor: "João Pedro",
            matricula: "2024020"
        },
        {
            id: 3,
            tipo: "sugestao",
            titulo: "Melhorar iluminação",
            descricao: "Instalar novas luminárias no corredor principal.",
            status: "em_analise",
            data: "11/04/2026",
            setor_origem: "Administrativo",
            setor_responsavel: "Administrativo",
            autor: "Carlos Lima",
            matricula: "2024033"
        },
        {
            id: 4,
            tipo: "sugestao",
            titulo: "Criar quadro de avisos",
            descricao: "Um quadro de avisos ajudaria na comunicação interna.",
            status: "aprovada",
            data: "10/04/2026",
            setor_origem: "RH",
            setor_responsavel: "RH",
            autor: "Fernanda Rocha",
            matricula: "2024008"
        },
        {
            id: 5,
            tipo: "ocorrencia",
            titulo: "Fio exposto no corredor",
            descricao: "Há um fio exposto próximo à recepção.",
            status: "concluida",
            prioridade: "alta",
            data: "09/04/2026",
            setor_origem: "Recepção",
            setor_responsavel: "Manutenção",
            autor: "Ana Souza",
            matricula: "2024050"
        },
        {
            id: 6,
            tipo: "ocorrencia",
            titulo: "Ar-condicionado fraco",
            descricao: "O ar-condicionado da sala de reuniões não está gelando bem.",
            status: "aberta",
            prioridade: "baixa",
            data: "08/04/2026",
            setor_origem: "Administrativo",
            setor_responsavel: "Manutenção",
            autor: "Lucas Mendes",
            matricula: "2024061"
        }
    ];

    let filtroAtual = "todas";

    nomeSidebar.textContent = gestor.nome;

    if (tipoUrl === "ocorrencia" || tipoUrl === "sugestao") {
        filtroAtual = tipoUrl;
    }

    function formatarStatus(status) {
        const mapa = {
            aberta: "Aberta",
            enviada: "Enviada",
            em_analise: "Em análise",
            em_andamento: "Em andamento",
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

    function atualizarResumo() {
        totalItens.textContent = solicitacoes.length;
        totalOcorrencias.textContent = solicitacoes.filter(item => item.tipo === "ocorrencia").length;
        totalSugestoes.textContent = solicitacoes.filter(item => item.tipo === "sugestao").length;
        totalEmAnalise.textContent = solicitacoes.filter(item => item.status === "em_analise").length;
    }

    function filtrarSolicitacoes() {
        const termo = inputBusca.value.trim().toLowerCase();

        return solicitacoes.filter((item) => {
            const bateFiltroTipo = filtroAtual === "todas" || item.tipo === filtroAtual;

            const bateFiltroPrioridade =
                !prioridadeUrl ||
                (item.tipo === "ocorrencia" && item.prioridade === prioridadeUrl);

            const bateFiltroStatus =
                !statusUrl || item.status === statusUrl;

            const textoCompleto = `
                ${item.titulo}
                ${item.descricao}
                ${item.setor_origem}
                ${item.setor_responsavel}
                ${item.autor}
                ${item.matricula}
                ${item.status || ""}
                ${item.prioridade || ""}
            `.toLowerCase();

            const bateBusca = textoCompleto.includes(termo);

            return (
                bateFiltroTipo &&
                bateFiltroPrioridade &&
                bateFiltroStatus &&
                bateBusca
            );
        });
    }

    function renderizar() {
        lista.innerHTML = "";

        const itens = filtrarSolicitacoes();

        if (itens.length === 0) {
            lista.innerHTML = `
                <div class="card-vazia">
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Não existem solicitações para os filtros informados.</p>
                </div>
            `;
            return;
        }

        itens.forEach((item) => {
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
                        <span><strong>Autor:</strong> ${item.autor}</span>
                        <span><strong>Matrícula:</strong> ${item.matricula}</span>
                        <span><strong>Origem:</strong> ${item.setor_origem}</span>
                        <span><strong>Responsável:</strong> ${item.setor_responsavel}</span>
                        <span><strong>Data:</strong> ${item.data}</span>
                        ${item.tipo === "ocorrencia" && item.prioridade ? `<span><strong>Prioridade:</strong> ${formatarPrioridade(item.prioridade)}</span>` : ""}
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

    function aplicarFiltroVisualInicial() {
        filtros.forEach((btn) => btn.classList.remove("ativo"));

        const botaoCorrespondente = [...filtros].find(
            (btn) => btn.dataset.filtro === filtroAtual
        );

        if (botaoCorrespondente) {
            botaoCorrespondente.classList.add("ativo");
        } else {
            const botaoTodas = [...filtros].find(
                (btn) => btn.dataset.filtro === "todas"
            );
            if (botaoTodas) botaoTodas.classList.add("ativo");
        }
    }

    filtros.forEach((botao) => {
        botao.addEventListener("click", () => {
            filtros.forEach(btn => btn.classList.remove("ativo"));
            botao.classList.add("ativo");
            filtroAtual = botao.dataset.filtro;
            renderizar();
        });
    });

    inputBusca.addEventListener("input", renderizar);

    atualizarResumo();
    aplicarFiltroVisualInicial();
    renderizar();
});