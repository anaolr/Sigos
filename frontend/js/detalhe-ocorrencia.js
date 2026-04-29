// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token) {
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const nomeSidebar = document.getElementById("nome-sidebar");
    const perfilSidebar = document.getElementById("perfil-sidebar");
    const ferramentas = document.getElementById("ferramentas");
    
    if (nomeSidebar && nome) nomeSidebar.textContent = nome;

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    const blocoGestao = document.getElementById("bloco-gestao");
    const blocoResponsavel = document.getElementById("bloco-responsavel");
    const blocoObservacao = document.getElementById("bloco-observacao");
    const btnSalvar = document.getElementById("btn-salvar");
    const btnReabrir = document.getElementById("btn-reabrir");
    const btnPdf = document.getElementById("btn-pdf");

    const campos = {
        titulo: document.getElementById("titulo"),
        descricao: document.getElementById("descricao"),
        categoria: document.getElementById("categoria"),
        setorOrigem: document.getElementById("setor_origem"),
        setorResponsavel: document.getElementById("setor_responsavel"),
        local: document.getElementById("local"),
        urgencia: document.getElementById("urgencia"),
        autor: document.getElementById("autor"),
        dataEnvio: document.getElementById("data_envio"),
        status: document.getElementById("status"),
        prioridade: document.getElementById("prioridade"),
        responsavelOcorrencia: document.getElementById("responsavel_ocorrencia"), // O <select>
        responsavelAtual: document.getElementById("responsavel_atual"), // O <input> readonly
        observacao: document.getElementById("observacao_gestor"),
        anexo: document.getElementById("preview-anexo"),
        mensagem: document.getElementById("mensagem-ocorrencia"),
        form: document.getElementById("form-ocorrencia")
    };

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // ==========================================
    // DICIONÁRIOS DE TRADUÇÃO (BANCO <-> HTML)
    // ==========================================
    const statusParaBanco = { "aberta": "Aberta", "em_analise": "Em análise", "em_andamento": "Em andamento", "concluida": "Concluída" };
    const statusParaHTML = { "Aberta": "aberta", "Em análise": "em_analise", "Em andamento": "em_andamento", "Concluída": "concluida" };

    const prioridadeParaBanco = { "baixa": "baixa", "media": "média", "alta": "alta", "critica": "crítica" };
    const prioridadeParaHTML = { "baixa": "baixa", "média": "media", "alta": "alta", "crítica": "critica" };

// ==========================================
    // LÓGICA DO MODAL DE REABRIR OCORRÊNCIA
    // ==========================================
    const modalReabrir = document.getElementById("modal-reabrir");
    const btnCancelarReabrir = document.getElementById("btn-cancelar-reabrir");
    const btnConfirmarReabrir = document.getElementById("btn-confirmar-reabrir");
    const motivoReabertura = document.getElementById("motivo_reabertura");

    // 1. Abre o modal ao clicar em Reabrir
    if (btnReabrir) {
        btnReabrir.addEventListener("click", () => {
            if (modalReabrir) modalReabrir.classList.add("ativo");
        });
    }

    // 2. Fecha o modal ao clicar em Cancelar
    if (btnCancelarReabrir) {
        btnCancelarReabrir.addEventListener("click", () => {
            if (modalReabrir) modalReabrir.classList.remove("ativo");
            if (motivoReabertura) motivoReabertura.value = ""; // Limpa o texto
        });
    }

    // 3. Confirma a Reabertura e envia para o Banco
    if (btnConfirmarReabrir) {
        btnConfirmarReabrir.addEventListener("click", async () => {
            const motivo = motivoReabertura ? motivoReabertura.value.trim() : "";
            
            if (!motivo) {
                if (campos.mensagem) {
                    campos.mensagem.style.color = "red";
                    campos.mensagem.textContent = "Informe o motivo da reabertura.";
                }
                return;
            }

            // Junta a observação antiga com o motivo da reabertura
            const observacaoAtual = campos.observacao.value ? campos.observacao.value + "\n\n" : "";
            const novaObservacao = observacaoAtual + ">> REABERTURA: " + motivo;

            const payload = {
                status: "Em análise", // Volta o status para Em análise
                prioridade: campos.prioridade.value,
                observacao: novaObservacao
            };

            try {
                const response = await fetch(`${API_URL}/api/ocorrencias/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    // Fecha o modal
                    if (modalReabrir) modalReabrir.classList.remove("ativo");
                    
                    if (campos.mensagem) {
                        campos.mensagem.style.color = "green";
                        campos.mensagem.textContent = "Ocorrência reaberta com sucesso!";
                    }
                    
                    // Esconde o botão de reabrir novamente
                    btnReabrir.style.display = "none";
                    
                    // Recarrega a página para puxar os dados atualizados
                    carregarDadosReais(); 
                } else {
                    throw new Error("Erro ao reabrir.");
                }
            } catch (erro) {
                console.error(erro);
                if (campos.mensagem) {
                    campos.mensagem.style.color = "red";
                    campos.mensagem.textContent = "Erro de conexão ao reabrir ocorrência.";
                }
            }
        });
    }

    function montarMenu(perfil) {
        const perfisNomes = { "funcionario": "Funcionário", "gestor": "Gestor", "admin": "Administrador" };
        if(perfilSidebar) perfilSidebar.textContent = perfisNomes[perfil] || "Usuário";

        if (perfil === "funcionario") {
            ferramentas.innerHTML = `
                <div class="link-menu"><i class="fa-solid fa-house"></i><a href="./dashboard-funcionario.html">Início</a></div>
                <div class="link-menu"><i class="fa-solid fa-circle-exclamation"></i><a href="./nova-ocorrencia.html">Nova ocorrência</a></div>
                <div class="link-menu"><i class="fa-solid fa-lightbulb"></i><a href="./nova-sugestao.html">Nova sugestão</a></div>
                <div class="link-menu"><i class="fa-solid fa-folder-open"></i><a href="./minhas-solicitacoes.html">Minhas solicitações</a></div>
                <div class="link-menu"><i class="fa-solid fa-comments"></i><a href="./mural-sugestoes.html">Mural de Sugestões</a></div>
                <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-funcionario.html">Perfil</a></div>
            `;
        } else if (perfil === "gestor") {
            ferramentas.innerHTML = `
                <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-gestor.html">Perfil</a></div>
                <div class="link-menu"><i class="fa-solid fa-folder-open"></i><a href="./painel-solicitacoes-gestor.html">Solicitações</a></div>
                <div class="link-menu"><i class="fa-solid fa-table-columns"></i><a href="./dashboard-gestor.html">Dashboard</a></div>
                <div class="link-menu"><i class="fa-solid fa-bell"></i><a href="./notificacoes.html">Notificações</a></div>
            `;
        } else if (perfil === "admin") {
            // ---> ADICIONE ESTE BLOCO AQUI <---
            ferramentas.innerHTML = `
                <div class="link-menu"><i class="fa-solid fa-user"></i><a href="./perfil-admin.html">Perfil</a></div>
                <div class="link-menu"><i class="fa-solid fa-user-plus"></i><a href="./cadastro-usuario.html">Cadastro</a></div>
                <div class="link-menu"><i class="fa-solid fa-chart-line"></i><a href="./dashboard-admin.html">Dashboard</a></div>
                <div class="link-menu"><i class="fa-solid fa-bell"></i><a href="./notificacoes-admin.html">Notificações</a></div>
            `;
        }
    }

    function aplicarPermissoes(perfil) {
        if (perfil === "gestor" || perfil === "admin") {
            if(campos.status) campos.status.disabled = false;
            if(campos.prioridade) campos.prioridade.disabled = false;
            if(campos.responsavelOcorrencia) campos.responsavelOcorrencia.disabled = false;
            if(campos.observacao) campos.observacao.disabled = false;
            
            if(blocoGestao) blocoGestao.style.display = "grid";
            if(blocoResponsavel) blocoResponsavel.style.display = "block";
            if(blocoObservacao) blocoObservacao.style.display = "block";
            if(btnSalvar) btnSalvar.style.display = "inline-block";
        } else {
            if(campos.status) campos.status.disabled = true;
            if(campos.prioridade) campos.prioridade.disabled = true;
            if(campos.responsavelOcorrencia) campos.responsavelOcorrencia.disabled = true;
            if(campos.observacao) campos.observacao.disabled = true;
            
            if(blocoGestao) blocoGestao.style.display = "none";
            if(blocoResponsavel) blocoResponsavel.style.display = "none";
            if(blocoObservacao) blocoObservacao.style.display = "none";
            if(btnSalvar) btnSalvar.style.display = "none";
            if(btnReabrir) btnReabrir.style.display = "none";
        }
    }

    function formatarSetor(setor) {
        if (!setor || setor === "N/A") return "N/A";
        const s = String(setor).toLowerCase();
        if (s === "ti") return "TI";
        if (s === "rh") return "RH";
        if (s === "manutencao") return "Manutenção";
        if (s === "limpeza") return "Limpeza";
        if (s === "administrativo") return "Administrativo";
        if (s === "seguranca" || s === "segurança") return "Segurança";
        return setor.charAt(0).toUpperCase() + setor.slice(1);
    }

    // ==========================================
    // BUSCAR USUÁRIOS REAIS PARA O <SELECT>
    // ==========================================
    async function carregarResponsaveis(setorDaOcorrencia) {
        if (!campos.responsavelOcorrencia) return;

        try {
            const response = await fetch(`${API_URL}/api/auth/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const usuarios = await response.json();
                
                // Filtra para mostrar apenas funcionários do setor que tem de resolver a ocorrência
                const funcionariosDoSetor = usuarios.filter(u => 
                    u.setor && 
                    u.setor.toLowerCase() === setorDaOcorrencia.toLowerCase()
                );

                // Limpa o select e coloca os reais
                campos.responsavelOcorrencia.innerHTML = '<option value="">Selecione...</option>';
                
                funcionariosDoSetor.forEach(func => {
                    const cargoTexto = func.cargo ? ` - ${func.cargo}` : "";
                    campos.responsavelOcorrencia.innerHTML += `<option value="${func.nome}">${func.nome}${cargoTexto}</option>`;
                });
            }
        } catch (e) {
            console.error("Erro ao carregar responsáveis:", e);
        }
    }

    // ==========================================
    // CARREGAR DADOS REAIS DA OCORRÊNCIA
    // ==========================================
    async function carregarDadosReais() {
        try {
            const response = await fetch(`${API_URL}/api/ocorrencias/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao buscar dados");
            const oco = await response.json();

            if(campos.titulo) campos.titulo.value = oco.titulo || "";
            if(campos.descricao) campos.descricao.value = oco.descricao || "";
            if(campos.categoria) campos.categoria.value = oco.categoria || "N/A";
            
            const setorOrigemFormatado = formatarSetor(oco.setorOrigem);
            const setorResponsavelFormatado = formatarSetor(oco.setorResponsavel);

            if(campos.setorOrigem) campos.setorOrigem.value = setorOrigemFormatado;
            if(campos.setorResponsavel) campos.setorResponsavel.value = setorResponsavelFormatado;
            
            if(campos.local) campos.local.value = oco.local || "N/A";
            if(campos.urgencia) campos.urgencia.value = oco.urgencia || "N/A";
            if(campos.autor) campos.autor.value = oco.User ? oco.User.nome : "Desconhecido";
            if(campos.dataEnvio) campos.dataEnvio.value = new Date(oco.createdAt).toLocaleString('pt-BR');
            if(campos.observacao) campos.observacao.value = oco.observacao || "";
            
            // Preenche o responsável atual (se existir)
            if(campos.responsavelAtual) {
                campos.responsavelAtual.value = oco.responsavel || "Nenhum responsável definido";
            }

            // Tradução do Banco para HTML
            if(campos.status) campos.status.value = statusParaHTML[oco.status] || "aberta";
            if(campos.prioridade) campos.prioridade.value = prioridadeParaHTML[oco.prioridade] || "baixa";

            if (campos.anexo) {
                if (oco.anexo) {
                    campos.anexo.src = oco.anexo.startsWith('http') ? oco.anexo : `${API_URL}/uploads/${oco.anexo}`;
                    campos.anexo.style.display = "block";
                } else {
                    campos.anexo.style.display = "none";
                }
            }

            if ((role === "gestor" || role === "admin") && oco.status === "Concluída" && btnReabrir) {
                btnReabrir.style.display = "inline-block";
            }

            // Agora que sabemos qual é o setor responsável, vamos buscar os funcionários dele
            if (role === "gestor" || role === "admin") {
                carregarResponsaveis(oco.setorResponsavel);
            }

        } catch (erro) {
            console.error(erro);
            if(campos.mensagem) campos.mensagem.textContent = "Erro ao carregar detalhes.";
        }
    }

    if(campos.form) campos.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(campos.mensagem) {
            campos.mensagem.textContent = "Salvando...";
            campos.mensagem.style.color = "blue";
        }

        if (role === "funcionario") return;

        // Descobre quem é o responsável a salvar
        // Se ele escolheu alguém no <select>, guarda essa pessoa. Senão, mantém o que já estava.
        let responsavelFinal = campos.responsavelAtual.value;
        if (campos.responsavelOcorrencia && campos.responsavelOcorrencia.value !== "") {
            responsavelFinal = campos.responsavelOcorrencia.value;
        }

        // Traduz do HTML para a exigência do Banco
        const payload = {
            status: statusParaBanco[campos.status.value],
            prioridade: prioridadeParaBanco[campos.prioridade.value],
            observacao: campos.observacao.value.trim(),
            responsavel: responsavelFinal !== "Nenhum responsável definido" ? responsavelFinal : null
        };

        try {
            const response = await fetch(`${API_URL}/api/ocorrencias/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if(campos.mensagem) {
                    campos.mensagem.style.color = "green";
                    campos.mensagem.textContent = "✅ Alterações salvas com sucesso!";
                    
                    // Atualiza o visual
                    if(campos.responsavelAtual) campos.responsavelAtual.value = responsavelFinal;
                }
            } else {
                throw new Error("Erro ao salvar.");
            }
        } catch (erro) {
            console.error(erro);
            if(campos.mensagem) {
                campos.mensagem.style.color = "red";
                campos.mensagem.textContent = "❌ Falha ao salvar alterações.";
            }
        }
    });

    if (btnPdf) btnPdf.addEventListener("click", () => window.print());

    montarMenu(role);
    aplicarPermissoes(role);
    if (id) carregarDadosReais();
});