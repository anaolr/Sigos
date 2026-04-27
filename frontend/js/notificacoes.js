document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. PORTEIRO DE SEGURANÇA E LOGOUT
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token || role !== "gestor") {
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
    // 2. LÓGICA DA PÁGINA
    // ==========================================
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");
    const cardsNaoLidos = document.querySelectorAll(".card-notificacao.nao-lida");
    const resumoNaoLidas = document.getElementById("resumo-nao-lidas");

    // Atualiza contagem inicial
    let qtdNaoLidas = cardsNaoLidos.length;
    
    function atualizarTextoResumo() {
        if (!resumoNaoLidas) return;
        
        if (qtdNaoLidas === 0) {
            resumoNaoLidas.textContent = "Não tem novas notificações";
        } else {
            resumoNaoLidas.textContent = `Tem ${qtdNaoLidas} notificação(ões) não lida(s)`;
        }
    }
    atualizarTextoResumo();

    // Botão de marcar como lidas (apenas efeito visual por enquanto)
    if (btnMarcarLidas) {
        btnMarcarLidas.addEventListener("click", () => {
            cardsNaoLidos.forEach(card => {
                card.classList.remove("nao-lida");
                card.classList.add("lida");
            });
            qtdNaoLidas = 0;
            atualizarTextoResumo();
        });
    }
});