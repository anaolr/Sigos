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
    const blocoParecer = document.getElementById("bloco-parecer");
    const btnSalvar = document.getElementById("btn-salvar");
    const btnPdf = document.getElementById("btn-pdf");

    const campos = {
        titulo: document.getElementById("titulo"),
        descricao: document.getElementById("descricao"),
        setor: document.getElementById("setor_origem"),
        beneficio: document.getElementById("beneficio_esperado"),
        autor: document.getElementById("autor"),
        dataEnvio: document.getElementById("data_envio"),
        votos: document.getElementById("votos"),
        status: document.getElementById("status"),
        parecerGestor: document.getElementById("parecer_gestor"),
        anexo: document.getElementById("preview-anexo"),
        mensagem: document.getElementById("mensagem-sugestao"),
        form: document.getElementById("form-sugestao")
    };

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // DICIONÁRIO DE TRADUÇÃO DE STATUS (Banco <-> HTML)
    const statusParaHTML = {
        "Enviada": "enviada",
        "Em análise": "em_analise",
        "Aprovada": "aprovada",
        "Rejeitada": "rejeitada"
    };

    const statusParaBanco = {
        "enviada": "Enviada",
        "em_analise": "Em análise",
        "aprovada": "Aprovada",
        "rejeitada": "Rejeitada"
    };

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
            if(campos.parecerGestor) campos.parecerGestor.disabled = false;
            if(blocoGestao) blocoGestao.style.display = "block";
            if(blocoParecer) blocoParecer.style.display = "block";
            if(btnSalvar) btnSalvar.style.display = "inline-block";
        } else {
            if(campos.status) campos.status.disabled = true;
            if(campos.parecerGestor) campos.parecerGestor.disabled = true;
            if(blocoGestao) blocoGestao.style.display = "none";
            if(blocoParecer) blocoParecer.style.display = "none";
            if(btnSalvar) btnSalvar.style.display = "none";
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

    async function carregarSugestaoReal() {
        try {
            const response = await fetch(`${API_URL}/api/sugestoes/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao buscar dados");
            const sug = await response.json();

            if(campos.titulo) campos.titulo.value = sug.titulo || "";
            if(campos.descricao) campos.descricao.value = sug.descricao || "";
            if(campos.setor) campos.setor.value = formatarSetor(sug.setor);
            if(campos.beneficio) campos.beneficio.value = sug.beneficio || "";
            if(campos.autor) campos.autor.value = sug.User ? sug.User.nome : "Anónimo";
            if(campos.dataEnvio) campos.dataEnvio.value = new Date(sug.createdAt).toLocaleString('pt-BR');
            if(campos.votos) campos.votos.value = `${sug.votos || 0} voto(s)`;
            if(campos.parecerGestor) campos.parecerGestor.value = sug.parecer || "";

            // Traduz o status do Banco para selecionar a opção certa no HTML
            if(campos.status) {
                campos.status.value = statusParaHTML[sug.status] || "enviada";
            }

            if (campos.anexo) {
                if (sug.anexo) {
                    campos.anexo.src = sug.anexo.startsWith('http') ? sug.anexo : `${API_URL}/uploads/${sug.anexo}`;
                    campos.anexo.style.display = "block";
                } else {
                    campos.anexo.style.display = "none";
                }
            }
        } catch (e) {
            console.error("Erro ao carregar detalhes:", e);
            if(campos.mensagem) {
                campos.mensagem.style.color = "red";
                campos.mensagem.textContent = "Erro ao carregar detalhes reais: " + e.message;
            }
        }
    }

    if(campos.form) campos.form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(campos.mensagem) {
            campos.mensagem.textContent = "Salvando...";
            campos.mensagem.style.color = "blue";
        }

        if (role === "funcionario") return;

        // Traduz o status do HTML de volta para o formato que o Banco aceita
        const payload = {
            status: statusParaBanco[campos.status.value], 
            parecer: campos.parecerGestor.value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/sugestoes/${id}`, {
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
                    campos.mensagem.textContent = "✅ Sugestão atualizada com sucesso!";
                }
            } else {
                throw new Error("Erro ao salvar");
            }
        } catch (erro) {
            console.error(erro);
            if(campos.mensagem) {
                campos.mensagem.style.color = "red";
                campos.mensagem.textContent = "❌ Erro ao salvar alterações no servidor.";
            }
        }
    });

    if (btnPdf) btnPdf.addEventListener("click", () => window.print());

    montarMenu(role);
    aplicarPermissoes(role);
    if (id) carregarSugestaoReal();
});