const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. SEGURANÇA E LOGOUT
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    // Verifica se tem token e se é admin
    if (!token || role !== "admin") {
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const nomeSidebar = document.getElementById("nome-sidebar");
    const tituloBoasVindas = document.getElementById("boas-vindas-nome");

    if (nome) {
        if (nomeSidebar) nomeSidebar.textContent = nome;
        if (tituloBoasVindas) tituloBoasVindas.textContent = `Olá, ${nome} 👋`;
    }

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    // Variável para guardar o gráfico de forma a poder ser destruído se precisar de recarregar
    let graficoPizza = null;

    // ==========================================
    // 2. FUNÇÕES AUXILIARES
    // ==========================================
    function formatarStatus(status) {
        const mapa = { "Em análise": "Em análise", "Aprovada": "Aprovada", "Rejeitada": "Rejeitada", "Enviada": "Enviada" };
        return mapa[status] || status;
    }

    function classeStatus(status) {
        const mapa = { "Em análise": "andamento", "Aprovada": "resolvida", "Rejeitada": "alta", "Enviada": "andamento" };
        return mapa[status] || "andamento";
    }

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

    // ==========================================
    // 3. BUSCAR E CALCULAR DADOS REAIS
    // ==========================================
    async function inicializarDashboardAdmin() {
        try {
            // Puxa tudo do banco (como admin, ele precisa ver a empresa inteira)
            const [resOco, resSug] = await Promise.all([
                fetch(`${API_URL}/api/ocorrencias/todas`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/sugestoes/todas`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const ocorrencias = resOco.ok ? await resOco.json() : [];
            const sugestoes = resSug.ok ? await resSug.json() : [];

            // ------------------------------------------------
            // CÁLCULOS DAS OCORRÊNCIAS
            // ------------------------------------------------
            const countAlta = ocorrencias.filter(o => o.prioridade === "alta" || o.prioridade === "crítica").length;
            const countMedia = ocorrencias.filter(o => o.prioridade === "média").length;
            const countBaixa = ocorrencias.filter(o => o.prioridade === "baixa").length;

            const countAbertas = ocorrencias.filter(o => o.status === "Aberta").length;
            const countAndamento = ocorrencias.filter(o => o.status === "Em andamento").length;
            const countResolvidas = ocorrencias.filter(o => o.status === "Concluída").length;
            const countCriticas = ocorrencias.filter(o => o.prioridade === "crítica").length;

            // ------------------------------------------------
            // CÁLCULOS DAS SUGESTÕES
            // ------------------------------------------------
            const sugestoesAnalise = sugestoes.filter(s => s.status === "Em análise" || s.status === "Enviada").length;

            // Pegar as 2 sugestões com mais votos
            const sugestoesDestaque = [...sugestoes].sort((a, b) => (b.votos || 0) - (a.votos || 0)).slice(0, 2);
            
            // Total de votos na empresa
            const totalVotos = sugestoes.reduce((acc, sug) => acc + (sug.votos || 0), 0);

            // ------------------------------------------------
            // DESCOBRIR O SETOR MAIS CRÍTICO
            // ------------------------------------------------
            const contagemPorSetor = {};
            ocorrencias.forEach(o => {
                const setor = formatarSetor(o.setorResponsavel);
                if (setor !== "N/A") {
                    if (!contagemPorSetor[setor]) contagemPorSetor[setor] = 0;
                    contagemPorSetor[setor]++;
                }
            });

            let setorMaisCritico = "N/A";
            let maxOcorrencias = 0;
            for (const [setor, qtd] of Object.entries(contagemPorSetor)) {
                if (qtd > maxOcorrencias) {
                    maxOcorrencias = qtd;
                    setorMaisCritico = setor;
                }
            }

            // Descobrir a última ocorrência crítica/alta para o "Alerta"
            const ultimoAlerta = [...ocorrencias].find(o => o.prioridade === "crítica" || o.prioridade === "alta");

            // ==========================================
            // 4. INJETAR NO HTML
            // ==========================================
            
            // Cards Superiores
            document.getElementById("alta").innerText = countAlta;
            document.getElementById("media").innerText = countMedia;
            document.getElementById("baixa").innerText = countBaixa;

            // Indicadores
            document.getElementById("tempo").innerText = "A calcular..."; // Precisaria de lógica complexa de datas
            document.getElementById("setor").innerText = setorMaisCritico;
            document.getElementById("sugestoes_analise").innerText = sugestoesAnalise;

            // Info Grid Inferior
            document.getElementById("criticas").innerText = `${countCriticas} Críticas`;
            document.getElementById("andamento").innerText = `${countAndamento} Em andamento`;
            document.getElementById("abertas").innerText = `${countAbertas} Abertas`;
            document.getElementById("resolvidas").innerText = `${countResolvidas} Resolvidas`;

            // Bloco de Alerta
            if (ultimoAlerta) {
                document.getElementById("alertaSetor").innerText = formatarSetor(ultimoAlerta.setorResponsavel);
                document.getElementById("alertaLocal").innerText = ultimoAlerta.local || "N/A";
                document.getElementById("alertaPrioridade").innerText = ultimoAlerta.prioridade ? ultimoAlerta.prioridade.charAt(0).toUpperCase() + ultimoAlerta.prioridade.slice(1) : "Alta";
            } else {
                document.getElementById("alertaSetor").innerText = "Nenhum";
                document.getElementById("alertaLocal").innerText = "N/A";
                document.getElementById("alertaPrioridade").innerText = "Normal";
            }

            // Lista de Sugestões em Destaque
            const listaDestaque = document.getElementById("lista-sugestoes-destaque-admin");
            if (listaDestaque) {
                listaDestaque.innerHTML = "";
                
                if (sugestoesDestaque.length === 0) {
                    listaDestaque.innerHTML = "<p>Nenhuma sugestão recebida.</p>";
                } else {
                    sugestoesDestaque.forEach(sug => {
                        const article = document.createElement("article");
                        article.classList.add("sugestao-destaque-admin");
                        article.innerHTML = `
                            <div class="sugestao-topo-admin">
                                <span class="tag-setor-admin">${formatarSetor(sug.setor)}</span>
                                <span class="votos-admin"><i class="fa-solid fa-thumbs-up"></i> ${sug.votos || 0}</span>
                            </div>
                            <h4>${sug.titulo}</h4>
                            <p>${sug.descricao}</p>
                            <span class="tag status-sugestao-admin ${classeStatus(sug.status)}">
                                ${formatarStatus(sug.status)}
                            </span>
                        `;
                        listaDestaque.appendChild(article);
                    });
                }
            }

            // Resumo da Votação
            const resumoVotacao = document.getElementById("resumo-votacao-admin");
            if (resumoVotacao) {
                resumoVotacao.innerHTML = `
                    <span><i class="fa-solid fa-thumbs-up"></i> ${totalVotos} apoios totais</span>
                `;
            }

            // Montar Gráfico
            criarGrafico(countAlta, countMedia, countBaixa);

        } catch (error) {
            console.error("Erro ao carregar Dashboard do Admin:", error);
        }
    }

    function criarGrafico(alta, media, baixa) {
        const ctx = document.getElementById("graficoPizza");
        if (!ctx) return;

        if (graficoPizza) {
            graficoPizza.destroy();
        }

        graficoPizza = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Alta/Crítica", "Média", "Baixa"],
                datasets: [{
                    data: [alta, media, baixa],
                    backgroundColor: ["#f5b5b5", "#fff1b8", "#c8f0d2"],
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#333", font: { size: 12 } }
                    }
                }
            }
        });
    }

    // Inicia tudo
    inicializarDashboardAdmin();
});