document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const btnMarcarLidas = document.getElementById("btn-marcar-lidas");
    const cardsNaoLidos = document.querySelectorAll(".card-notificacao.nao-lida");
    const resumoNaoLidas = document.getElementById("resumo-nao-lidas");

    // Verifica quem está logado
    const usuarioString = localStorage.getItem("usuarioLogado");
    if (!usuarioString) {
        window.location.href = "./login.html";
    }
    const gestor = JSON.parse(usuarioString);
    nomeSidebar.textContent = gestor.nome;

    // Atualiza contagem inicial
    let qtdNaoLidas = cardsNaoLidos.length;
    
    function atualizarTextoResumo() {
        if (qtdNaoLidas === 0) {
            resumoNaoLidas.textContent = "Não tem novas notificações";
        } else {
            resumoNaoLidas.textContent = `Tem ${qtdNaoLidas} notificação(ões) não lida(s)`;
        }
    }
    atualizarTextoResumo();

    // Botão de marcar como lidas (apenas efeito visual)
    btnMarcarLidas.addEventListener("click", () => {
        cardsNaoLidos.forEach(card => {
            card.classList.remove("nao-lida");
            card.classList.add("lida");
        });
        qtdNaoLidas = 0;
        atualizarTextoResumo();
    });
});