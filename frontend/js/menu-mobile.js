document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------
    // 1. INJEÇÃO DE CSS (Menu Mobile + Menu Ativo)
    // --------------------------------------------------------
    const style = document.createElement("style");
    style.innerHTML = `
        /* Estilo do botão Hamburguer no Header */
        #btn-hamburguer { display: none; background: transparent; border: none; color: white; font-size: 1.8rem; cursor: pointer; margin-left: auto; padding: 5px; }
        #overlay-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 998; opacity: 0; transition: opacity 0.3s ease; }
        #btn-fechar-menu { display: none; position: absolute; top: 15px; right: 20px; background: transparent; border: none; color: white; font-size: 1.8rem; cursor: pointer; z-index: 1001; }

        /* Estilo para a página atual (Menu Ativo) */
        .link-menu.ativo {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding-left: 10px;
            border-left: 4px solid #f1c40f;
            transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            #btn-hamburguer { display: block; }
            #btn-fechar-menu { display: block; }
            
            #painel { 
                position: fixed !important; 
                top: 0; 
                left: 0; 
                height: 100vh !important; 
                width: 260px !important; 
                z-index: 999; 
                transform: translateX(-100%); 
                transition: transform 0.3s ease; 
                margin: 0 !important; 
                background-color: #2c3e50 !important; /* Azul escuro do painel */
                overflow-y: auto !important; 
                overflow-x: hidden !important;
                display: block !important;
                padding-bottom: 120px !important; 
            }
            
            #painel.menu-aberto { transform: translateX(0); }
            #overlay-menu.ativo { display: block; opacity: 1; }

            /* Forçar o botão de logout azul e visível */
            #btn-logout {
                display: flex !important;
                visibility: visible !important;
                margin: 50px auto 20px auto !important;
                width: 85% !important;
                padding: 12px !important;
                background-color: #3498db !important; /* AZUL VOLTOU AQUI */
                color: white !important;
                border-radius: 8px !important;
                justify-content: center;
                align-items: center;
                text-decoration: none !important;
                border: none !important;
                font-weight: bold;
                cursor: pointer;
            }

            #usuario { flex-direction: column !important; margin-top: 50px; margin-bottom: 30px; text-align: center; }
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "overlay-menu";
    document.body.appendChild(overlay);

    const header = document.querySelector("header");
    if (header) {
        const btnHamburguer = document.createElement("button");
        btnHamburguer.id = "btn-hamburguer";
        btnHamburguer.innerHTML = '<i class="fa-solid fa-bars"></i>';
        header.appendChild(btnHamburguer);
        btnHamburguer.addEventListener("click", abrirMenu);
    }

    const painel = document.getElementById("painel");
    if (painel) {
        const btnFechar = document.createElement("button");
        btnFechar.id = "btn-fechar-menu";
        btnFechar.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        painel.insertBefore(btnFechar, painel.firstChild);
        btnFechar.addEventListener("click", fecharMenu);
    }

    function abrirMenu() {
        if (painel) painel.classList.add("menu-aberto");
        overlay.classList.add("ativo");
        document.body.style.overflow = "hidden";
    }

    function fecharMenu() {
        if (painel) painel.classList.remove("menu-aberto");
        overlay.classList.remove("ativo");
        document.body.style.overflow = "auto";
    }

    overlay.addEventListener("click", fecharMenu);

    const linksMenu = document.querySelectorAll(".link-menu a");
    const urlAtual = window.location.pathname.split("/").pop();

    linksMenu.forEach(link => {
        const hrefDoLink = link.getAttribute("href").replace("./", "");
        if (hrefDoLink === urlAtual) {
            link.parentElement.classList.add("ativo");
        }
    });

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.removeAttribute("onclick");
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "../pages/login.html";
        });
    }
});