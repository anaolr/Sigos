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
    const nomeUsuario = document.getElementById("nome-usuario");
    
    if (nomeSidebar && nome) nomeSidebar.textContent = nome;
    if (nomeUsuario && nome) nomeUsuario.textContent = nome;

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    const ocorrenciasAbertas = document.getElementById("ocorrencias-abertas");
    const ocorrenciasAndamento = document.getElementById("ocorrencias-andamento");
    const sugestoesEnviadas = document.getElementById("sugestoes-enviadas");
    const sugestoesAprovadas = document.getElementById("sugestoes-aprovadas");
    const listaAtividades = document.getElementById("lista-atividades");
    const listaSugestoesDestaque = document.querySelector(".sugestoes-grid");

    async function carregarDashboardCompleto() {
        try {
            const headers = { "Authorization": `Bearer ${token}` };
            
            // Fazemos 3 pedidos ao mesmo tempo:
            // 1. Minhas ocorrências (para os contadores)
            // 2. Minhas sugestões (para os contadores)
            // 3. Todas as sugestões (para o Top 2 Destaques)
            const [resOcoMinhas, resSugMinhas, resSugTodas] = await Promise.all([
                fetch("http://localhost:3000/api/ocorrencias/minhas", { headers }),
                fetch("http://localhost:3000/api/sugestoes/minhas", { headers }),
                fetch("http://localhost:3000/api/sugestoes", { headers })
            ]);

            // Se der tudo certo, transformamos em JSON. Se não, array vazio.
            const minhasOcorrencias = resOcoMinhas.ok ? await resOcoMinhas.json() : [];
            const minhasSugestoes = resSugMinhas.ok ? await resSugMinhas.json() : [];
            const todasSugestoes = resSugTodas.ok ? await resSugTodas.json() : [];

            // CONTADORES (Atenção às maiúsculas exigidas pelo banco)
            const countAbertas = minhasOcorrencias.filter(o => o.status === "Aberta" || o.status === "Em análise").length;
            const countAndamento = minhasOcorrencias.filter(o => o.status === "Em andamento").length;
            const countSugestoes = minhasSugestoes.length;
            const countSugAprovadas = minhasSugestoes.filter(s => s.status === "Aprovada").length;

            if(ocorrenciasAbertas) ocorrenciasAbertas.textContent = countAbertas;
            if(ocorrenciasAndamento) ocorrenciasAndamento.textContent = countAndamento;
            if(sugestoesEnviadas) sugestoesEnviadas.textContent = countSugestoes;
            if(sugestoesAprovadas) sugestoesAprovadas.textContent = countSugAprovadas;

            // ATIVIDADES RECENTES (Últimas 3 coisas que a pessoa fez)
            if (listaAtividades) {
                listaAtividades.innerHTML = "";
                
                // Junta tudo, transforma as datas para comparar e ordena da mais nova para mais velha
                const todasMinhas = [
                    ...minhasOcorrencias.map(o => ({ tipo: 'Ocorrência', msg: o.titulo, data: new Date(o.createdAt) })),
                    ...minhasSugestoes.map(s => ({ tipo: 'Sugestão', msg: s.titulo, data: new Date(s.createdAt) }))
                ].sort((a, b) => b.data - a.data).slice(0, 3); // Corta para mostrar apenas 3

                if(todasMinhas.length === 0) {
                    listaAtividades.innerHTML = "<p>Nenhuma atividade recente.</p>";
                } else {
                    todasMinhas.forEach(ativ => {
                        const div = document.createElement("div");
                        div.classList.add("atividade-item");
                        
                        // Formatação da data para ficar bonita (ex: 26/04/2026 às 14:30)
                        const dataFormatada = ativ.data.toLocaleDateString('pt-BR') + ' às ' + 
                                              String(ativ.data.getHours()).padStart(2, '0') + ':' + 
                                              String(ativ.data.getMinutes()).padStart(2, '0');

                        div.innerHTML = `<p><strong>${ativ.tipo}:</strong> ${ativ.msg}</p><span>${dataFormatada}</span>`;
                        listaAtividades.appendChild(div);
                    });
                }
            }

            // SUGESTÕES EM DESTAQUE GERAIS (Top 2 com mais votos)
            if(listaSugestoesDestaque) {
                listaSugestoesDestaque.innerHTML = "";
                
                // Ordena TODAS as sugestões pelos votos e pega as 2 primeiras
                const topSugestoes = [...todasSugestoes].sort((a, b) => (b.votos || 0) - (a.votos || 0)).slice(0, 2);
                let votosUsuario = JSON.parse(localStorage.getItem("votosSugestoes")) || [];

                if (topSugestoes.length === 0) {
                    listaSugestoesDestaque.innerHTML = "<p>Nenhuma sugestão enviada na empresa ainda.</p>";
                } else {
                    topSugestoes.forEach(sug => {
                        const jaVotou = votosUsuario.includes(sug.id);
                        const article = document.createElement("article");
                        article.classList.add("sugestao-card");
                        
                        // A coluna no seu banco para sugestões chama-se 'setor'
                        article.innerHTML = `
                            <div class="sugestao-topo">
                                <span class="tag-setor">${sug.setor || "Geral"}</span>
                                <span class="votos"><i class="fa-solid fa-thumbs-up"></i> ${sug.votos || 0}</span>
                            </div>
                            <h3>${sug.titulo}</h3>
                            <p>${sug.descricao}</p>
                            <div class="acoes-sugestao">
                                <button class="btn-votar ${jaVotou ? "votado" : ""}" disabled>
                                    <i class="fa-solid ${jaVotou ? "fa-check" : "fa-thumbs-up"}"></i>
                                    ${jaVotou ? "Votado" : "Apoiar no Mural"}
                                </button>
                            </div>
                        `;
                        listaSugestoesDestaque.appendChild(article);
                    });
                }
            }

        } catch(erro) {
            console.error("Erro ao carregar dashboard:", erro);
        }
    }

    carregarDashboardCompleto();
});