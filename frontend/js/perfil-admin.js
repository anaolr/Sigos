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

    // Verifica se tem token e se é realmente um administrador
    if (!token || role !== "admin") {
        localStorage.clear();
        window.location.href = "login.html";
        return; 
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
    // 2. ELEMENTOS DO DOM
    // ==========================================
    const form = document.getElementById("form-perfil-admin");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnAlterarFoto = document.getElementById("btn-alterar-foto");
    const inputFoto = document.getElementById("input-foto");
    const previewFoto = document.getElementById("preview-foto");
    const iconeFoto = document.getElementById("icone-foto");
    const mensagem = document.getElementById("mensagem-perfil");
    const nomeSidebar = document.getElementById("nome-sidebar");

    const campos = {
        nome: document.getElementById("nome"),
        matricula: document.getElementById("matricula"),
        email: document.getElementById("email"),
        tipoUsuario: document.getElementById("tipo_usuario"),
        cargo: document.getElementById("cargo"),
        setor: document.getElementById("setor"),
        senha: document.getElementById("senha"),
        confirmarSenha: document.getElementById("confirmar-senha"),
    };

    let dadosOriginais = {};
    let fotoOriginal = "";

    // ==========================================
    // 3. BUSCAR DADOS REAIS
    // ==========================================
    async function carregarPerfil() {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const dadosUsuarioBanco = await response.json();
                preencherFormulario(dadosUsuarioBanco);
                salvarEstadoOriginal(dadosUsuarioBanco);
            } else {
                throw new Error("Sessão expirada ou erro no servidor");
            }
        } catch (erro) {
            console.error("Erro de conexão ao buscar perfil:", erro);
            localStorage.clear();
            window.location.href = "./login.html";
        }
    }

    function preencherFormulario(dados) {
        if(campos.nome) campos.nome.value = dados.nome || "";
        if(campos.matricula) campos.matricula.value = dados.matricula || "";
        if(campos.email) campos.email.value = dados.email || "";
        if(campos.tipoUsuario) campos.tipoUsuario.value = "Administrador";
        if(campos.cargo) campos.cargo.value = dados.cargo || "Diretoria"; // Admin geralmente é diretoria
        if(campos.setor) campos.setor.value = dados.setor || "Administração";
        if(campos.senha) campos.senha.value = "";
        if(campos.confirmarSenha) campos.confirmarSenha.value = "";
        
        if (nomeSidebar) nomeSidebar.textContent = dados.nome || "Administrador";

        if (dados.foto) {
            previewFoto.src = `${API_URL}/uploads/${dados.foto}`;
            previewFoto.style.display = "block";
            iconeFoto.style.display = "none";
        } else {
            previewFoto.src = "";
            previewFoto.style.display = "none";
            iconeFoto.style.display = "block";
        }
    }

    function salvarEstadoOriginal(dados) {
        dadosOriginais = {
            nome: dados.nome || "",
            email: dados.email || "",
        };
        fotoOriginal = dados.foto || "";
    }

    // ==========================================
    // 4. INTERAÇÕES E VALIDAÇÃO
    // ==========================================
    function restaurarFormulario() {
        campos.nome.value = dadosOriginais.nome || "";
        campos.email.value = dadosOriginais.email || "";
        campos.senha.value = "";
        campos.confirmarSenha.value = "";
        if (nomeSidebar) nomeSidebar.textContent = dadosOriginais.nome || "Administrador";
        
        mensagem.textContent = "";

        if (fotoOriginal) {
            previewFoto.src = `${API_URL}/uploads/${fotoOriginal}`;
            previewFoto.style.display = "block";
            iconeFoto.style.display = "none";
        } else {
            previewFoto.src = "";
            previewFoto.style.display = "none";
            iconeFoto.style.display = "block";
        }

        inputFoto.value = "";
    }

    function validarFormulario() {
        const nome = campos.nome.value.trim();
        const email = campos.email.value.trim();
        const senha = campos.senha.value;
        const confirmarSenha = campos.confirmarSenha.value;

        if (!nome) {
            mensagem.textContent = "O nome é obrigatório.";
            mensagem.style.color = "#d62828";
            campos.nome.focus();
            return false;
        }

        if (!email) {
            mensagem.textContent = "O e-mail é obrigatório.";
            mensagem.style.color = "#d62828";
            campos.email.focus();
            return false;
        }

        if (senha || confirmarSenha) {
            if (senha.length < 6) {
                mensagem.textContent = "A nova senha deve ter pelo menos 6 caracteres.";
                mensagem.style.color = "#d62828";
                campos.senha.focus();
                return false;
            }

            if (senha !== confirmarSenha) {
                mensagem.textContent = "As senhas não coincidem.";
                mensagem.style.color = "#d62828";
                campos.confirmarSenha.focus();
                return false;
            }
        }
        return true;
    }

    // ==========================================
    // 5. SALVAR DADOS NO BANCO DE DADOS
    // ==========================================
    async function salvarAlteracoes(event) {
        event.preventDefault();
        mensagem.textContent = "A salvar...";
        mensagem.style.color = "blue";

        if (!validarFormulario()) return;

        // Usa FormData para permitir o envio da foto real para o Multer
        const formData = new FormData();
        formData.append("nome", campos.nome.value.trim());
        formData.append("email", campos.email.value.trim());

        if (campos.senha.value.trim() !== "") {
            formData.append("senha", campos.senha.value.trim());
        }

        if (inputFoto.files[0]) {
            formData.append("foto", inputFoto.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }, // Não coloque Content-Type aqui!
                body: formData
            });

            if (response.ok) {
                const dadosSalvos = await response.json();
                
                mensagem.style.color = "green";
                mensagem.textContent = "Alterações salvas com sucesso!";

                // Atualiza o estado original com os novos dados
                dadosOriginais.nome = dadosSalvos.nome;
                fotoOriginal = dadosSalvos.foto || fotoOriginal; // Guarda o novo nome da foto
                
                // Atualiza o Cache local
                localStorage.setItem("nome", dadosSalvos.nome);
                if (nomeSidebar) nomeSidebar.textContent = dadosSalvos.nome;

                campos.senha.value = "";
                campos.confirmarSenha.value = "";
                inputFoto.value = "";
            } else {
                throw new Error("Erro ao salvar no servidor");
            }
        } catch (error) {
            console.error(error);
            mensagem.style.color = "#d62828";
            mensagem.textContent = "Erro de conexão ao tentar salvar.";
        }
    }

    // Interações de Foto
    if (btnAlterarFoto) {
        btnAlterarFoto.addEventListener("click", () => inputFoto.click());
    }

    if (inputFoto) {
        inputFoto.addEventListener("change", (event) => {
            const arquivo = event.target.files[0];
            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "Selecione um ficheiro de imagem válido.";
                inputFoto.value = "";
                return;
            }

            const leitor = new FileReader();
            leitor.onload = function (e) {
                previewFoto.src = e.target.result;
                previewFoto.style.display = "block";
                iconeFoto.style.display = "none";
                mensagem.textContent = "";
            };
            leitor.readAsDataURL(arquivo);
        });
    }

    if (campos.nome) {
        campos.nome.addEventListener("input", () => {
            if (nomeSidebar) nomeSidebar.textContent = campos.nome.value.trim() || "Administrador";
        });
    }

    if (btnCancelar) btnCancelar.addEventListener("click", restaurarFormulario);
    if (form) form.addEventListener("submit", salvarAlteracoes);

    // Arranca a página puxando os dados
    carregarPerfil();
});