// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. SEGURANÇA E LOGOUT
    // ==========================================
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nomeAtual = localStorage.getItem("nome");

    // Verifica se tem token e se é Administrador. Se não for, expulsa!
    if (!token || role !== "admin") {
        localStorage.clear();
        window.location.href = "./login.html";
        return; 
    }

    const nomeSidebar = document.getElementById("nome-sidebar");
    if (nomeSidebar && nomeAtual) {
        nomeSidebar.textContent = nomeAtual;
    }

    const btnSair = document.getElementById("btn-logout");
    if (btnSair) {
        btnSair.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    // ==========================================
    // 2. ELEMENTOS DO FORMULÁRIO
    // ==========================================
    const form = document.getElementById("form-cadastro-usuario");
    const btnCancelar = document.getElementById("btn-cancelar");
    const mensagem = document.getElementById("mensagem-cadastro");

    const campos = {
        nome: document.getElementById("nome"),
        email: document.getElementById("email"),
        matricula: document.getElementById("matricula"),
        cargo: document.getElementById("cargo"),
        setor: document.getElementById("setor"),
        tipoUsuario: document.getElementById("tipo_usuario"),
        senha: document.getElementById("senha"),
        confirmarSenha: document.getElementById("confirmar_senha"),
    };

    function limparFormulario() {
        if(form) form.reset();
        if(mensagem) mensagem.textContent = "";
    }

    // ==========================================
    // 3. VALIDAÇÃO ANTES DO ENVIO
    // ==========================================
    function validarFormulario() {
        mensagem.style.color = "#d62828"; // Vermelho para erros

        if (!campos.nome.value.trim()) {
            mensagem.textContent = "Informe o nome completo.";
            campos.nome.focus();
            return false;
        }
        if (!campos.email.value.trim() || !campos.email.value.includes('@')) {
            mensagem.textContent = "Informe um e-mail válido.";
            campos.email.focus();
            return false;
        }
        if (!campos.matricula.value.trim()) {
            mensagem.textContent = "A matrícula é obrigatória.";
            campos.matricula.focus();
            return false;
        }
        if (!campos.setor.value) {
            mensagem.textContent = "Selecione um setor para o utilizador.";
            campos.setor.focus();
            return false;
        }
        if (!campos.tipoUsuario.value) {
            mensagem.textContent = "Selecione o tipo de utilizador.";
            campos.tipoUsuario.focus();
            return false;
        }
        if (campos.senha.value.length < 6) {
            mensagem.textContent = "A senha deve ter pelo menos 6 caracteres.";
            campos.senha.focus();
            return false;
        }
        if (campos.senha.value !== campos.confirmarSenha.value) {
            mensagem.textContent = "As senhas não coincidem.";
            campos.confirmarSenha.focus();
            return false;
        }
        return true;
    }

    // ==========================================
    // 4. REGISTO NO BANCO DE DADOS
    // ==========================================
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            if(mensagem) {
                mensagem.textContent = "A registar...";
                mensagem.style.color = "blue";
            }

            if (!validarFormulario()) return;

            // Montar o Payload (O que vai para o Backend)
            const payload = {
                nome: campos.nome.value.trim(),
                email: campos.email.value.trim(),
                senha: campos.senha.value,
                role: campos.tipoUsuario.value, // "funcionario", "gestor" ou "admin"
                matricula: campos.matricula.value.trim(),
                cargo: campos.cargo.value.trim() || "N/A", // Se não preencher, guarda "N/A"
                setor: campos.setor.value.trim(), 
            };

            try {
                // Chama a rota de Registo (que já estava pronta no seu Backend)
                const response = await fetch(`${API_URL}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                        // Não passamos o Bearer Token aqui porque a rota de register original não exigia.
                        // Se o seu backend exigir, descomente a linha abaixo:
                        // "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (response.ok) {
                    if(mensagem) {
                        mensagem.style.color = "green";
                        mensagem.textContent = `✅ Utilizador (${payload.nome}) cadastrado com sucesso!`;
                    }
                    form.reset();
                } else {
                    // Erros do tipo: "Email já existe"
                    throw new Error(data.message || data.erro || "Erro ao cadastrar utilizador.");
                }
            } catch (erro) {
                if(mensagem) {
                    mensagem.style.color = "#d62828";
                    mensagem.textContent = erro.message === "Failed to fetch" 
                        ? "❌ Erro: O servidor (Backend) está desligado." 
                        : `❌ ${erro.message}`;
                }
                console.error("Erro no fetch:", erro);
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", limparFormulario);
    }
});