const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://sigos-production.up.railway.app";

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

    const nomeSidebar = document.getElementById("nome-sidebar");
    const tituloBoasVindas = document.getElementById("boas-vindas-nome");

    async function inicializarDashboard() {
        try {
            const resPerfil = await fetch(`${API_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!resPerfil.ok) throw new Error("Erro ao buscar perfil do gestor");
            
            const gestor = await resPerfil.json();
            if (nomeSidebar) nomeSidebar.textContent = gestor.nome;
            if (tituloBoasVindas) tituloBoasVindas.textContent = `Olá, ${gestor.nome} 👋`;

            const setorGestor = gestor.setor || "";

            const [resOco, resSug] = await Promise.all([
                fetch(`${API_URL}/api/ocorrencias/todas`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/sugestoes/todas`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const ocorrenciasDB = resOco.ok ? await resOco.json() : [];
            const sugestoesDB = resSug.ok ? await resSug.json() : [];

            // Filtro pelo setor do Gestor
            const minhasOcorrencias = ocorrenciasDB.filter(oco => {
                if (!oco.setorResponsavel || !setorGestor) return false;
                return oco.setorResponsavel.toLowerCase() === setorGestor.toLowerCase();
            });

            const minhasSugestoes = sugestoesDB.filter(sug => {
                if (!sug.setor || !setorGestor) return false;
                return sug.setor.toLowerCase() === setorGestor.toLowerCase();
            });

            // ==========================================
            // D. ESTATÍSTICAS CORRIGIDAS
            // ==========================================
            // Conta APENAS as ocorrências com status "Aberta"
            const countAbertas = minhasOcorrencias.filter(o => o.status === "Aberta").length;
            
            const countAndamento = minhasOcorrencias.filter(o => o.status === "Em andamento").length;
            const countResolvidas = minhasOcorrencias.filter(o => o.status === "Concluída").length;
            
            const countCriticas = minhasOcorrencias.filter(o => o.prioridade === "crítica" && o.status !== "Concluída").length;
            const countAltas = minhasOcorrencias.filter(o => o.prioridade === "alta" && o.status !== "Concluída").length;
            const countMedias = minhasOcorrencias.filter(o => o.prioridade === "média" && o.status !== "Concluída").length;
            const countBaixas = minhasOcorrencias.filter(o => o.prioridade === "baixa" && o.status !== "Concluída").length;

            const cardAlta = document.querySelector(".prioridade-alta .numero");
            const cardMedia = document.querySelector(".prioridade-media .numero");
            const cardBaixa = document.querySelector(".prioridade-baixa .numero");
            const cardAbertas = document.querySelector(".card-resumo.neutro .numero");

            if (cardAlta) cardAlta.textContent = countCriticas + countAltas; 
            if (cardMedia) cardMedia.textContent = countMedias;
            if (cardBaixa) cardBaixa.textContent = countBaixas;
            if (cardAbertas) cardAbertas.textContent = countAbertas;

            const textosResumo = document.querySelectorAll(".item-resumo p");
            if (textosResumo.length >= 2) {
                textosResumo[0].textContent = `${countAbertas} ocorrências aguardando ação`;
                textosResumo[1].textContent = `${minhasSugestoes.length} sugestões enviadas para o setor`;
            }

            const textosFaixa = document.querySelectorAll(".faixa p");
            if (textosFaixa.length >= 3) {
                textosFaixa[0].textContent = `${countCriticas} casos precisam de atenção imediata`;
                textosFaixa[1].textContent = `${countAndamento} ocorrências já estão sendo tratadas`;
                textosFaixa[2].textContent = `${countResolvidas} ocorrências concluídas este mês`;
            }

            const cardsPainel = document.querySelectorAll(".card-painel");
            if (cardsPainel.length >= 2) {
                const containerOcorrencias = cardsPainel[1];
                containerOcorrencias.querySelectorAll(".ocorrencia").forEach(div => div.remove());

                const ultimas = [...minhasOcorrencias].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

                if (ultimas.length === 0) {
                    containerOcorrencias.insertAdjacentHTML('beforeend', '<p style="margin-top: 15px; color: var(--text-color);">Nenhuma ocorrência sob responsabilidade deste setor.</p>');
                } else {
                    ultimas.forEach(oco => {
                        const classePri = oco.prioridade === "crítica" || oco.prioridade === "alta" ? "alta" : (oco.prioridade === "média" ? "media" : "baixa");
                        const statClass = oco.status ? oco.status.toLowerCase().replace(/ /g, '-') : "aberta";
                        const nomePrioridade = oco.prioridade ? oco.prioridade.charAt(0).toUpperCase() + oco.prioridade.slice(1) : "Baixa";
                        
                        const html = `
                            <div class="ocorrencia">
                                <div>
                                    <strong>${oco.titulo}</strong>
                                    <p>Origem: Setor ${oco.setorOrigem || "Geral"}</p>
                                </div>
                                <div class="tags">
                                    <span class="tag ${classePri}">${nomePrioridade}</span>
                                    <span class="tag ${statClass}">${oco.status || "Aberta"}</span>
                                </div>
                            </div>
                        `;
                        containerOcorrencias.insertAdjacentHTML('beforeend', html);
                    });
                }
            }

            const listaSugestoesSetor = document.getElementById("lista-sugestoes-setor");
            if (listaSugestoesSetor) {
                listaSugestoesSetor.innerHTML = "";
                
                const ultimasSug = [...minhasSugestoes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
                
                if (ultimasSug.length === 0) {
                    listaSugestoesSetor.innerHTML = '<p style="color: var(--text-color);">Nenhuma sugestão direcionada a este setor.</p>';
                } else {
                    ultimasSug.forEach(sug => {
                        const statusClass = sug.status === "Aprovada" ? "resolvida" : (sug.status === "Rejeitada" ? "alta" : "andamento");
                        const setorInfo = sug.User ? sug.User.setor : "Geral";

                        const html = `
                            <div class="sugestao">
                                <div class="sugestao-info">
                                    <strong>${sug.titulo}</strong>
                                    <p>Enviada pelo setor ${setorInfo}</p>
                                </div>
                                <div class="sugestao-extra">
                                    <span class="votos-box"><i class="fa-solid fa-thumbs-up"></i> ${sug.votos || 0} apoios</span>
                                    <span class="tag ${statusClass}">${sug.status || "Enviada"}</span>
                                </div>
                            </div>
                        `;
                        listaSugestoesSetor.insertAdjacentHTML('beforeend', html);
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        }
    }

    inicializarDashboard();

    const cardsFiltro = document.querySelectorAll(".card-resumo[data-filtro]");
    cardsFiltro.forEach(card => {
        card.addEventListener("click", () => {
            const filtro = card.dataset.filtro;
            window.location.href = `./painel-solicitacoes-gestor.html?prioridade=${filtro}`;
        });
    });
});