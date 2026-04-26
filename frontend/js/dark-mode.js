document.addEventListener("DOMContentLoaded", () => {
    // 1. Cria e injeta o CSS global do Modo Escuro
    const style = document.createElement("style");
    style.innerHTML = `
     /* 1. FUNDOS PRINCIPAIS (--bg) */
        body.dark-theme,
        body.dark-theme main,
        body.dark-theme #content-detalhes,
        body.dark-theme #content-dashboard,
        body.dark-theme #content-perfil,
        body.dark-theme #content-cadastro,
        body.dark-theme #content-painel,
        body.dark-theme #content-solicitacoes, 
        body.dark-theme #content-ocorrencia,   
        body.dark-theme #content-sugestao,     
        body.dark-theme #content-notificacoes {
            background-color: #0f172a !important; 
            color: #f1f5f9 !important; 
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* 2. CARTÕES E CAIXAS PRINCIPAIS (--card) */
        body.dark-theme header,
        body.dark-theme aside#painel,
        body.dark-theme .card,
        body.dark-theme .card-resumo,
        body.dark-theme .card-solicitacao,
        body.dark-theme .card-perfil,
        body.dark-theme .card-info,
        body.dark-theme .card-notificacao,
        body.dark-theme .faixa,
        body.dark-theme .sugestao,
        body.dark-theme .ocorrencia,
        body.dark-theme .dados,
        body.dark-theme .info-grid,
        body.dark-theme .modal-content,
        body.dark-theme .card-painel,
        body.dark-theme .grafico-box,
        body.dark-theme .sugestao-destaque-admin,
        body.dark-theme .search-box,
        body.dark-theme .boas-vindas,         
        body.dark-theme .card-formulario,     
        body.dark-theme .acao-item,           
        body.dark-theme .atividade-item,      
        body.dark-theme .sugestao-card,       
        body.dark-theme .card-vazia {
            background-color: #1e293b !important; 
            border-color: #334155 !important; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;
            transition: background-color 0.3s ease;
        }

        /* 3. CAIXAS INTERNAS (Para dar contraste com os cartões) */
        /* Resolve o sumiço do "2 dias", "Produção", "2 Críticas", etc. */
        body.dark-theme .box,
        body.dark-theme .info,
        body.dark-theme .item-resumo,
        body.dark-theme .sugestao-box {
            background-color: #334155 !important; /* Mais claro que o cartão principal */
            border: 1px solid #475569 !important;
            color: #f1f5f9 !important;
            box-shadow: none !important;
        }

        /* Destacar notificações não lidas */
        body.dark-theme .card-notificacao.nao-lida {
            background-color: #334155 !important;
        }

        /* 4. CORES DOS TEXTOS ESPECÍFICOS */
        body.dark-theme h1, body.dark-theme h2, body.dark-theme h3, body.dark-theme h4,
        body.dark-theme p, body.dark-theme span, body.dark-theme a, body.dark-theme label,
        body.dark-theme strong,
        body.dark-theme .info h3, body.dark-theme .card-painel h3,
        body.dark-theme .sugestao-destaque-admin h4,
        body.dark-theme .sugestao-destaque-admin p,
        body.dark-theme .atividade-item p, body.dark-theme .atividade-item span,
        body.dark-theme .sugestao-card h3, body.dark-theme .sugestao-card p,
        body.dark-theme .card-formulario h3 {
            color: #f1f5f9 !important;
        }

        /* 5. FORMULÁRIOS (Inputs, Selects e Textareas) */
        body.dark-theme input, 
        body.dark-theme select, 
        body.dark-theme textarea {
            background-color: #111827 !important;
            color: #f1f5f9 !important;
            border: 1px solid #334155 !important;
        }

        /* --- CORREÇÃO DA BARRA DE PESQUISA --- */
        /* Faz o input ficar transparente para se fundir com a caixa da barra */
        body.dark-theme .search-box input {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        /* 6. INPUTS BLOQUEADOS (Telas de detalhes) */
        body.dark-theme input[readonly],
        body.dark-theme textarea[readonly],
        body.dark-theme select:disabled {
            background-color: #0f172a !important; 
            color: #94a3b8 !important; 
            border-color: #1e293b !important;
        }

        /* 7. CORES DE ALERTA, PRIORIDADE E TAGS DE STATUS */
        body.dark-theme .red, body.dark-theme .prioridade-alta { background-color: #450a0a !important; color: #fca5a5 !important; border-color: #7f1d1d !important; }
        body.dark-theme .yellow, body.dark-theme .prioridade-media { background-color: #422006 !important; color: #fde047 !important; border-color: #713f12 !important; }
        body.dark-theme .green, body.dark-theme .prioridade-baixa { background-color: #052e16 !important; color: #86efac !important; border-color: #14532d !important; }
        
        body.dark-theme .alerta { background-color: #422006 !important; border-left-color: #f59e0b !important; color: #fde047 !important; }
        body.dark-theme .alerta span { color: #fef08a !important; }
        
        body.dark-theme .tag-setor-admin, 
        body.dark-theme .tag-setor, 
        body.dark-theme .votos-box { 
            background-color: #334155 !important; 
            color: #93c5fd !important; 
        }

        /* --- AQUI ESTÁ A CORREÇÃO "BLINDADA" DAS TAGS DE STATUS --- */
        body.dark-theme .tag, 
        body.dark-theme .status { 
            border: 1px solid transparent !important; 
        }
        
        /* Prioridades */
        body.dark-theme .alta, body.dark-theme .critica { background-color: #450a0a !important; color: #fca5a5 !important; border-color: #7f1d1d !important; }
        body.dark-theme .media { background-color: #422006 !important; color: #fde047 !important; border-color: #713f12 !important; }
        body.dark-theme .baixa { background-color: #052e16 !important; color: #86efac !important; border-color: #14532d !important; }
        
        /* Status: Em Andamento */
        body.dark-theme .andamento, 
        body.dark-theme .em-andamento, 
        body.dark-theme .em_andamento { 
            background-color: #1e3a8a !important; color: #93c5fd !important; border-color: #1e40af !important; 
        }
        
        /* Status: Aberta */
        body.dark-theme .aberta { 
            background-color: #374151 !important; color: #d1d5db !important; border-color: #4b5563 !important; 
        }
        
        /* Status: Concluída / Resolvida / Aprovada */
        body.dark-theme .concluida, 
        body.dark-theme .resolvida,
        body.dark-theme .aprovada,
        body.dark-theme .aprovado { 
            background-color: #064e3b !important; color: #6ee7b7 !important; border-color: #047857 !important; 
        }
        
        /* Status: Em Análise */
        body.dark-theme .analise, 
        body.dark-theme .em-analise, 
        body.dark-theme .em_analise { 
            background-color: #312e81 !important; color: #c7d2fe !important; border-color: #3730a3 !important; 
        }

        /* Status: Rejeitada / Cancelada (Bônus de prevenção!) */
        body.dark-theme .rejeitada,
        body.dark-theme .rejeitado,
        body.dark-theme .cancelada {
            background-color: #450a0a !important; color: #fca5a5 !important; border-color: #7f1d1d !important;
        }


        /* 8. HOVER DOS MENUS E BOTÕES */
        body.dark-theme .link-menu:hover, 
        body.dark-theme .acao-item:hover,
        body.dark-theme .filtro,
        body.dark-theme .filtro:hover,
        body.dark-theme .filtro.ativo,
        body.dark-theme .sugestao-card:hover {
            background-color: #273449 !important;
            color: #f1f5f9 !important;
            border-radius: 8px;
        }
        
        body.dark-theme .btn-votar { background-color: #3b82f6 !important; color: #fff !important; }
        body.dark-theme .btn-votar.votado { background-color: #334155 !important; color: #94a3b8 !important; }

        /* 9. BOTÃO DO TEMA (Sol/Lua) */
        #btn-theme-toggle {
            background: transparent; border: none; color: inherit; font-size: 1.5rem;
            cursor: pointer; margin-left: auto; margin-right: 15px;
            transition: transform 0.3s ease, color 0.3s ease;
        }
        body.dark-theme #btn-theme-toggle { color: #3b82f6; }
        #btn-theme-toggle:hover { transform: scale(1.15) rotate(15deg); }
    `;
    document.head.appendChild(style);

    // 2. Criar o botão (Lua/Sol) e colocá-lo no header
    const header = document.querySelector("header");
    let btnToggle;

    if (header) {
        btnToggle = document.createElement("button");
        btnToggle.id = "btn-theme-toggle";
        btnToggle.title = "Alternar Tema";
        
        // Verifica na memória se o utilizador já tinha escolhido o tema escuro antes
        const temaAtual = localStorage.getItem("temaSIGOS");
        if (temaAtual === "dark") {
            btnToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            btnToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }

        // Tenta inserir o botão antes do botão hamburguer (para ficar organizado)
        const btnHamburguer = document.getElementById("btn-hamburguer");
        if (btnHamburguer) {
            header.insertBefore(btnToggle, btnHamburguer);
        } else {
            // Se não houver hamburguer (ex: ecrã grande), adiciona no fim do header
            header.appendChild(btnToggle);
        }
    }

    // 3. Função que liga/desliga o modo escuro
    function aplicarTema(tema) {
        if (tema === "dark") {
            document.body.classList.add("dark-theme");
            if (btnToggle) btnToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem("temaSIGOS", "dark"); // Guarda na memória do browser
        } else {
            document.body.classList.remove("dark-theme");
            if (btnToggle) btnToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem("temaSIGOS", "light"); // Guarda na memória do browser
        }
    }

    // 4. Carrega o estado inicial mal a página abre
    const temaSalvo = localStorage.getItem("temaSIGOS");
    if (temaSalvo === "dark") {
        aplicarTema("dark");
    }

    // 5. O que acontece quando clica no botão
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            const temaAtual = document.body.classList.contains("dark-theme") ? "dark" : "light";
            // Se está dark, muda para light. Se está light, muda para dark.
            aplicarTema(temaAtual === "dark" ? "light" : "dark");
        });
    }
});