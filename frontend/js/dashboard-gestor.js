document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. SEGURANÇA E PERSONALIZAÇÃO
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    // Verifica se tem token E se o usuário é realmente um gestor
    if (!token || role !== "gestor") {
        localStorage.clear(); // Limpa tudo para evitar bumerangue
        window.location.href = "./login.html";
        return; // Impede que o resto do código rode
    }

    // Atualiza o nome na tela
    const nomeSidebar = document.getElementById("nome-sidebar");
    const tituloBoasVindas = document.getElementById("boas-vindas-nome");

    if (nome) {
        if (nomeSidebar) nomeSidebar.textContent = nome;
        if (tituloBoasVindas) tituloBoasVindas.textContent = `Olá, ${nome} 👋`;
    }

    // ==========================================
    // 2. LÓGICA DE LOGOUT
    // ==========================================
    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (event) => {
            event.preventDefault(); // Evita recarregar a página sem querer
            localStorage.clear(); // Apaga as credenciais
            window.location.href = "./login.html"; // Redireciona
        });
    }

    // ==========================================
    // 3. INTERAÇÕES DOS CARDS (Filtros)
    // ==========================================
    const cards = document.querySelectorAll(".card-resumo[data-filtro]");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const filtro = card.dataset.filtro;
            window.location.href = `./painel-solicitacoes-gestor.html?prioridade=${filtro}`;
        });
    });

    // ==========================================
    // 4. RENDERIZAÇÃO DE DADOS (Mock)
    // ==========================================
    const listaSugestoesSetor = document.getElementById("lista-sugestoes-setor");

    const sugestoesSetorMock = [
        { id: 1, titulo: "Melhorar rede Wi-Fi", setorOrigem: "Administrativo", votos: 23, status: "em_analise" },
        { id: 2, titulo: "Novo sistema interno", setorOrigem: "RH", votos: 17, status: "aprovada" },
        { id: 3, titulo: "Adicionar micro-ondas na copa", setorOrigem: "Financeiro", votos: 31, status: "em_analise" }
    ];

    function formatarStatus(status) {
        const mapa = { em_analise: "Em análise", aprovada: "Aprovada", rejeitada: "Rejeitada" };
        return mapa[status] || status;
    }

    function classeStatus(status) {
        const mapa = { em_analise: "andamento", aprovada: "resolvida", rejeitada: "alta" };
        return mapa[status] || "andamento";
    }

    function renderizarSugestoes() {
        if (!listaSugestoesSetor) return;
        listaSugestoesSetor.innerHTML = "";
        
        sugestoesSetorMock.forEach((sugestao) => {
            const div = document.createElement("div");
            div.classList.add("sugestao");
            div.innerHTML = `
                <div class="sugestao-info">
                    <strong>${sugestao.titulo}</strong>
                    <p>Enviada pelo setor ${sugestao.setorOrigem}</p>
                </div>
                <div class="sugestao-extra">
                    <span class="votos-box"><i class="fa-solid fa-thumbs-up"></i> ${sugestao.votos} apoios</span>
                    <span class="tag ${classeStatus(sugestao.status)}">${formatarStatus(sugestao.status)}</span>
                </div>
            `;
            listaSugestoesSetor.appendChild(div);
        });
    }

    renderizarSugestoes();
});