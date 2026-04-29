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
            
            const [resOcoMinhas, resSugMinhas, resSugTodas] = await Promise.all([
                fetch("http://localhost:3000/api/ocorrencias/minhas", { headers }),
                fetch("http://localhost:3000/api/sugestoes/minhas", { headers }),
                fetch("http://localhost:3000/api/sugestoes/todas", { headers })
            ]);

            const minhasOcorrencias = resOcoMinhas.ok ? await resOcoMinhas.json() : [];
            const minhasSugestoes = resSugMinhas.ok ? await resSugMinhas.json() : [];
            const todasSugestoes = resSugTodas.ok ? await resSugTodas.json() : [];

            // CONTADORES
            const countAbertas = minhasOcorrencias.filter(o => o.status === "Aberta" || o.status === "Em análise").length;
            const countAndamento = minhasOcorrencias.filter(o => o.status === "Em andamento").length;
            const countSugestoes = minhasSugestoes.length;
            const countSugAprovadas = minhasSugestoes.filter(s => s.status === "Aprovada").length;

            if(ocorrenciasAbertas) ocorrenciasAbertas.textContent = countAbertas;
            if(ocorrenciasAndamento) ocorrenciasAndamento.textContent = countAndamento;
            if(sugestoesEnviadas) sugestoesEnviadas.textContent = countSugestoes;
            if(sugestoesAprovadas) sugestoesAprovadas.textContent = countSugAprovadas;

            // ATIVIDADES RECENTES
            if (listaAtividades) {
                listaAtividades.innerHTML = "";
                
                const todasMinhas = [
                    ...minhasOcorrencias.map(o => ({ tipo: 'Ocorrência', msg: o.titulo, data: new Date(o.createdAt) })),
                    ...minhasSugestoes.map(s => ({ tipo: 'Sugestão', msg: s.titulo, data: new Date(s.createdAt) }))
                ].sort((a, b) => b.data - a.data).slice(0, 3); 

                if(todasMinhas.length === 0) {
                    listaAtividades.innerHTML = "<p>Nenhuma atividade recente.</p>";
                } else {
                    todasMinhas.forEach(ativ => {
                        const div = document.createElement("div");
                        div.classList.add("atividade-item");
                        
                        const dataFormatada = ativ.data.toLocaleDateString('pt-BR') + ' às ' + 
                                              String(ativ.data.getHours()).padStart(2, '0') + ':' + 
                                              String(ativ.data.getMinutes()).padStart(2, '0');

                        div.innerHTML = `<p><strong>${ativ.tipo}:</strong> ${ativ.msg}</p><span>${dataFormatada}</span>`;
                        listaAtividades.appendChild(div);
                    });
                }
            }

            // SUGESTÕES EM DESTAQUE GERAIS
            if(listaSugestoesDestaque) {
                listaSugestoesDestaque.innerHTML = "";
                
                const topSugestoes = [...todasSugestoes].sort((a, b) => (b.votos || 0) - (a.votos || 0)).slice(0, 2);

                if (topSugestoes.length === 0) {
                    listaSugestoesDestaque.innerHTML = "<p>Nenhuma sugestão enviada na empresa ainda.</p>";
                } else {
                    topSugestoes.forEach(sug => {
                        const article = document.createElement("article");
                        article.classList.add("sugestao-card");
                        
                        // Removi o "disabled" e as classes que o bloqueavam
                        article.innerHTML = `
                            <div class="sugestao-topo">
                                <span class="tag-setor">${sug.setor || "Geral"}</span>
                                <span class="votos"><i class="fa-solid fa-thumbs-up"></i> ${sug.votos || 0}</span>
                            </div>
                            <h3>${sug.titulo}</h3>
                            <p>${sug.descricao}</p>
                            <div class="acoes-sugestao">
                                <button class="btn-votar btn-apoio" data-id="${sug.id}" data-votos="${sug.votos || 0}">
                                    <i class="fa-solid fa-thumbs-up"></i> Apoiar (${sug.votos || 0})
                                </button>
                            </div>
                        `;
                        listaSugestoesDestaque.appendChild(article);
                    });

                    // Ativa a votação também no dashboard
                    listaSugestoesDestaque.onclick = async (e) => {
                        const botao = e.target.closest(".btn-votar");
                        if (!botao) return;
                        
                        e.preventDefault();
                        const id = botao.dataset.id;
                        
                        const textoOriginal = botao.innerHTML;
                        botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A votar...';
                        botao.disabled = true;

                        try {
                            const response = await fetch(`http://localhost:3000/api/sugestoes/${id}/votar`, {
                                method: "PUT",
                                headers: { "Authorization": `Bearer ${token}` }
                            });
                            
                            if (response.ok) {
                                carregarDashboardCompleto(); 
                            } else {
                                alert("Erro ao votar no dashboard.");
                                botao.innerHTML = textoOriginal;
                                botao.disabled = false;
                            }
                        } catch (err) {
                            console.error("Erro ao votar:", err);
                        }
                    };
                }
            }

        } catch(erro) {
            console.error("Erro ao carregar dashboard:", erro);
        }
    }

    carregarDashboardCompleto();
});