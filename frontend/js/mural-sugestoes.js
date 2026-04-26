document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const containerMural = document.getElementById("container-mural-completo");

    const usuarioString = localStorage.getItem("usuarioLogado");

    if (!usuarioString) {
        window.location.href = "./login.html";
        return;
    }

    const funcionarioMock = JSON.parse(usuarioString);

    const sugestoesMuralMock = [
        {
            id: 1,
            titulo: "Máquina de Café Expressa",
            descricao: "Substituir a garrafa térmica por uma máquina de cápsulas na copa do segundo andar.",
            setor: "Copa",
            votos: 10
        },
        {
            id: 2,
            titulo: "Ginástica Laboral",
            descricao: "Implementar 15 minutos de alongamento guiado para as equipes de TI.",
            setor: "Saúde",
            votos: 15
        }
    ];

    let votosUsuario = JSON.parse(localStorage.getItem("votosSugestoes")) || [];

    function preencherDadosUsuario() {
        if (nomeSidebar) nomeSidebar.textContent = funcionarioMock.nome;
    }

    function renderizarMural() {
        if (!containerMural) return;

        containerMural.innerHTML = "";

        sugestoesMuralMock.forEach((sugestao) => {
            const jaVotou = votosUsuario.includes(sugestao.id);

            const article = document.createElement("article");
            article.classList.add("sugestao-card");

            article.innerHTML = `
                <div class="sugestao-topo">
                    <span class="tag-setor">${sugestao.setor}</span>
                    <span class="votos">
                        <i class="fa-solid fa-thumbs-up"></i>
                        ${sugestao.votos}
                    </span>
                </div>

                <h3>${sugestao.titulo}</h3>

                <p>${sugestao.descricao}</p>

                <div class="acoes-sugestao">
                    <button class="btn-votar ${jaVotou ? "votado" : ""}" data-id="${sugestao.id}">
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
        const botoesVoto = document.querySelectorAll(".btn-votar");

        botoesVoto.forEach((botao) => {
            botao.addEventListener("click", () => {
                if (botao.classList.contains("votado")) return;

                const idSugestao = Number(botao.dataset.id);
                const sugestao = sugestoesMuralMock.find(item => item.id === idSugestao);

                if (!sugestao) return;

                sugestao.votos += 1;
                votosUsuario.push(idSugestao);

                localStorage.setItem("votosSugestoes", JSON.stringify(votosUsuario));

                renderizarMural();
            });
        });
    }

    preencherDadosUsuario();
    renderizarMural();
});