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
                
                /* AJUSTE PARA IPHONE: Layout Flexível */
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important; 
                background-color: #2c3e50; /* Cor padrão do seu painel */
            }

            /* Container que segura o Usuário e os Links */
            #painel-scroll-content {
                flex-grow: 1;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
                padding: 60px 15px 20px 15px;
            }
            
            /* Ajuste do botão Logout para ficar sempre no rodapé */
            #btn-logout {
                margin-top: auto !important;
                margin-bottom: calc(20px + env(safe-area-inset-bottom)) !important;
                width: 90% !important;
                align-self: center;
                padding: 12px !important;
                border-radius: 8px !important;
                text-align: center;
            }

            #painel.menu-aberto { transform: translateX(0); }
            #overlay-menu.ativo { display: block; opacity: 1; }
            #usuario { margin-bottom: 20px; text-align: center; }
        }
    `;
    document.head.appendChild(style);

    // --------------------------------------------------------
    // 2. MONTAGEM DA ESTRUTURA DOM
    // --------------------------------------------------------
    const overlay = document.createElement("div");
    overlay.id = "overlay-menu";
    document.body.appendChild(overlay);

    const painel = document.getElementById("painel");
    const header = document.querySelector("header");

    if (header) {
        const btnHamburguer = document.createElement("button");
        btnHamburguer.id = "btn-hamburguer";
        btnHamburguer.innerHTML = '<i class="fa-solid fa-bars"></i>';
        header.appendChild(btnHamburguer);
        btnHamburguer.addEventListener("click", abrirMenu);
    }

    if (painel) {
        // Botão Fechar
        const btnFechar = document.createElement("button");
        btnFechar.id = "btn-fechar-menu";
        btnFechar.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        painel.insertBefore(btnFechar, painel.firstChild);
        btnFechar.addEventListener("click", fecharMenu);

        // CRIAR WRAPPER DE SCROLL: Movemos tudo exceto o logout para dentro dele
        const scrollContent = document.createElement("div");
        scrollContent.id = "painel-scroll-content";
        
        // Pega todos os filhos atuais do painel (exceto o botão fechar e o logout)
        const children = Array.from(painel.children);
        const logoutBtn = document.getElementById("btn-logout");

        children.forEach(child => {
            if (child.id !== "btn-fechar-menu" && child.id !== "btn-logout") {
                scrollContent.appendChild(child);
            }
        });

        // Reorganiza: 1. Botão Fechar, 2. Conteúdo com Scroll, 3. Logout no fim
        painel.appendChild(scrollContent);
        if (logoutBtn) painel.appendChild(logoutBtn);
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

    // --------------------------------------------------------
    // 3. LÓGICA DE MENU ATIVO E LOGOUT
    // --------------------------------------------------------
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
        btnLogout.addEventListener("click", () => {
            localStorage.clear(); // Limpa tudo (token, role, nome)
            window.location.href = "../pages/login.html";
        });
    }
});