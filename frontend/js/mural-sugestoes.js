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

    const containerMural = document.getElementById("container-mural-completo");
    let sugestoesMural = [];
    let votosUsuario = JSON.parse(localStorage.getItem("votosSugestoes")) || [];

    async function carregarMural() {
        try {
            const response = await fetch("http://localhost:3000/api/sugestoes", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                sugestoesMural = await response.json();
                renderizarMural();
            }
        } catch (erro) {
            console.error("Erro ao carregar mural:", erro);
        }
    }

    function renderizarMural() {
        if (!containerMural) return;
        containerMural.innerHTML = "";

        if(sugestoesMural.length === 0) {
            containerMural.innerHTML = "<p>Nenhuma sugestão enviada ainda.</p>";
            return;
        }

        sugestoesMural.forEach((sugestao) => {
            const jaVotou = votosUsuario.includes(sugestao.id);
            const article = document.createElement("article");
            article.classList.add("sugestao-card");

            article.innerHTML = `
                <div class="sugestao-topo">
                    <span class="tag-setor">${sugestao.setorOrigem || "Geral"}</span>
                    <span class="votos"><i class="fa-solid fa-thumbs-up"></i> <span id="votos-${sugestao.id}">${sugestao.votos || 0}</span></span>
                </div>
                <h3>${sugestao.titulo}</h3>
                <p>${sugestao.descricao}</p>
                <div class="acoes-sugestao">
                    <button class="btn-votar ${jaVotou ? "votado" : ""}" data-id="${sugestao.id}" data-votos="${sugestao.votos || 0}">
                        <i class="fa-solid ${jaVotou ? "fa-check" : "fa-thumbs-up"}"></i>
                        ${jaVotou ? "Votado" : "Apoiar sugestão"}
                    </button>
                </div>
            `;
            containerMural.appendChild(article);
        });
        adicionarEventosVoto();
    }

    function adicionarEventosVoto() {
        document.querySelectorAll(".btn-votar").forEach((botao) => {
            botao.addEventListener("click", async () => {
                if (botao.classList.contains("votado")) return;
                
                const idSugestao = Number(botao.dataset.id);
                let qtdVotos = Number(botao.dataset.votos) + 1;

                try {
                    // Atualiza no Banco de Dados
                    const response = await fetch(`http://localhost:3000/api/sugestoes/${idSugestao}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ votos: qtdVotos })
                    });

                    if (response.ok) {
                        votosUsuario.push(idSugestao);
                        localStorage.setItem("votosSugestoes", JSON.stringify(votosUsuario));
                        
                        botao.classList.add("votado");
                        botao.innerHTML = `<i class="fa-solid fa-check"></i> Votado`;
                        document.getElementById(`votos-${idSugestao}`).textContent = qtdVotos;
                    }
                } catch (erro) {
                    console.error("Erro ao computar voto", erro);
                }
            });
        });
    }

    carregarMural();
});