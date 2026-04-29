// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. SEGURANÇA (VERIFICA SE É ADMIN)
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token || role !== "admin") {
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

    // ==========================================
    // 2. LÓGICA DAS NOTIFICAÇÕES REAIS
    // ==========================================
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");
    const resumoNaoLidas = document.getElementById("resumo-nao-lidas");
    const listaNotificacoes = document.getElementById("lista-notificacoes");

    async function carregarNotificacoes() {
        try {
            const response = await fetch(`${API_URL}/api/notificacoes`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao carregar notificações.");
            
            const notificacoes = await response.json();
            
            if (listaNotificacoes) listaNotificacoes.innerHTML = "";
            let naoLidas = 0;

            if (notificacoes.length === 0) {
                if(listaNotificacoes) listaNotificacoes.innerHTML = "<p style='color: var(--text-color); margin-top: 20px;'>Você não possui notificações.</p>";
            } else {
                notificacoes.forEach(notif => {
                    if (!notif.lida) naoLidas++;

                    let icone = "fa-bell";
                    let link = "#";

                    if (notif.tipo === "ocorrencia") {
                        icone = "fa-triangle-exclamation";
                        link = `./detalhe-ocorrencia.html?id=${notif.linkId}`;
                    } else if (notif.tipo === "sugestao") {
                        icone = "fa-lightbulb";
                        link = `./detalhe-sugestao.html?id=${notif.linkId}`;
                    } else if (notif.tipo === "usuario") {
                        icone = "fa-user-plus";
                        link = "./cadastro-usuario.html"; // Admin tem atalho para ir cadastrar
                    }

                    const statusClass = notif.lida ? "lida" : "nao-lida";

                    const html = `
                        <article class="card-notificacao ${statusClass} ${notif.tipo}">
                            <div class="icone-notificacao">
                                <i class="fa-solid ${icone}"></i>
                            </div>
                            <div class="conteudo-notificacao">
                                <div class="linha-topo">
                                    <span class="tipo">${notif.titulo}</span>
                                    <span class="data">${new Date(notif.createdAt).toLocaleString('pt-BR')}</span>
                                </div>
                                <p>${notif.mensagem}</p>
                                ${notif.linkId || notif.tipo === "usuario" ? `<a href="${link}" class="btn-detalhes">Ver detalhes</a>` : ''}
                            </div>
                        </article>
                    `;
                    listaNotificacoes.insertAdjacentHTML('beforeend', html);
                });
            }

            atualizarTextoResumo(naoLidas);

        } catch (error) {
            console.error("Erro:", error);
            if(listaNotificacoes) listaNotificacoes.innerHTML = "<p style='color: red; margin-top: 20px;'>Erro ao carregar o feed de notificações.</p>";
        }
    }

    function atualizarTextoResumo(qtd) {
        if (!resumoNaoLidas) return;
        if (qtd === 0) {
            resumoNaoLidas.textContent = "Não tem novas notificações";
        } else {
            resumoNaoLidas.textContent = `Você tem ${qtd} notificação(ões) não lida(s)`;
        }
    }

    if (btnMarcarLidas) {
        btnMarcarLidas.addEventListener("click", async () => {
            try {
                await fetch(`${API_URL}/api/notificacoes/lidas`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                carregarNotificacoes(); // Recarrega para pintar todas de cinza
            } catch (e) {
                console.error("Erro ao marcar como lidas:", e);
            }
        });
    }

    carregarNotificacoes();
});