document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. SEGURANÇA E LOGOUT
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token) {
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
    // 2. ELEMENTOS DO DOM
    // ==========================================
    const listaMural = document.getElementById("container-mural-completo"); // CORRIGIDO!

    // ==========================================
    // 3. LÓGICA DO MURAL
    // ==========================================
    async function carregarMural() {
        try {
            const response = await fetch("http://localhost:3000/api/sugestoes/todas", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao carregar sugestões");
            const sugestoes = await response.json();

            if (listaMural) {
                listaMural.innerHTML = "";
                
                if (sugestoes.length === 0) {
                    listaMural.innerHTML = "<p style='color: var(--text-color);'>Ainda não há sugestões no mural. Seja o primeiro a contribuir!</p>";
                    return;
                }

                sugestoes.forEach(sug => {
                    const statusClass = sug.status === "Aprovada" ? "resolvida" : (sug.status === "Rejeitada" ? "alta" : "andamento");
                    const autor = sug.User ? sug.User.nome : "Anónimo";
                    
                    const card = document.createElement("article");
                    card.className = "card-sugestao";
                    
                    // Estrutura mantida para encaixar no seu CSS
                    card.innerHTML = `
                        <div class="sugestao-header">
                            <h3>${sug.titulo}</h3>
                            <span class="tag ${statusClass}">${sug.status || "Enviada"}</span>
                        </div>
                        <p class="descricao">${sug.descricao}</p>
                        <div class="sugestao-meta">
                            <span><i class="fa-solid fa-user"></i> Autor: ${autor}</span>
                            <span><i class="fa-solid fa-building"></i> Setor Alvo: ${sug.setor}</span>
                        </div>
                        <div class="sugestao-acoes">
                            <button class="btn-votar btn-apoio" data-id="${sug.id}" data-votos="${sug.votos || 0}">
                                <i class="fa-solid fa-thumbs-up"></i> Apoiar (${sug.votos || 0})
                            </button>
                        </div>
                    `;
                    listaMural.appendChild(card);
                });

                adicionarEventosVoto();
            }
        } catch (erro) {
            console.error(erro);
            if(listaMural) listaMural.innerHTML = "<p style='color:red;'>Erro ao comunicar com o servidor.</p>";
        }
    }

    function adicionarEventosVoto() {
        if (!listaMural) return;
        listaMural.onclick = null; // Limpa eventos antigos

        listaMural.onclick = async (e) => {
            const botao = e.target.closest(".btn-votar");
            if (!botao) return;

            e.preventDefault();
            const id = botao.dataset.id;

            // Efeito visual de carregamento
            const textoOriginal = botao.innerHTML;
            botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A votar...';
            botao.disabled = true;

            try {
                // CHAMA A NOVA ROTA EXCLUSIVA DE VOTOS
                const response = await fetch(`http://localhost:3000/api/sugestoes/${id}/votar`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    carregarMural(); // Atualiza a tela com o novo voto
                } else {
                    alert("Não foi possível registar o voto.");
                    botao.innerHTML = textoOriginal;
                    botao.disabled = false;
                }
            } catch (error) {
                console.error("Erro ao votar:", error);
                botao.innerHTML = textoOriginal;
                botao.disabled = false;
            }
        };
    }

    carregarMural();
});