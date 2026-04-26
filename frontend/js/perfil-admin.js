document.addEventListener("DOMContentLoaded", () => {
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

    // --- NOVO SISTEMA DE VERIFICAÇÃO COM TOKEN ---
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nomeAtual = localStorage.getItem("nome");

    if (!token) {
        window.location.href = "login.html";
        return; // É muito importante colocar o return para parar o JS aqui
    }
    // ----------------------------------------------

    // MOCK: Dados falsos para preencher a tela por enquanto
    const adminMock = {
        nome: nomeAtual || "Administrador",
        matricula: "0000",
        email: "admin@sigos.com",
        tipo_usuario: "admin",
        cargo: "Diretoria",
        setor: "Administração",
        foto: "" 
    };

    let dadosOriginais = {};
    let fotoOriginal = "";

    function preencherFormulario(dados) {
        campos.nome.value = dados.nome || "";
        campos.matricula.value = dados.matricula || "";
        campos.email.value = dados.email || "";
        campos.tipoUsuario.value = dados.tipo_usuario || "";
        campos.cargo.value = dados.cargo || "";
        campos.setor.value = dados.setor || "";
        campos.senha.value = "";
        campos.confirmarSenha.value = "";
        
        if (nomeSidebar) nomeSidebar.textContent = dados.nome || "Administrador";

        if (dados.foto) {
            previewFoto.src = dados.foto;
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

    function restaurarFormulario() {
        campos.nome.value = dadosOriginais.nome || "";
        campos.email.value = dadosOriginais.email || "";
        campos.senha.value = "";
        campos.confirmarSenha.value = "";
        if (nomeSidebar) nomeSidebar.textContent = dadosOriginais.nome || "Administrador";
        
        mensagem.textContent = "";
        mensagem.style.color = "#d62828";

        if (fotoOriginal) {
            previewFoto.src = fotoOriginal;
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
            campos.nome.focus();
            return false;
        }

        if (!email) {
            mensagem.textContent = "O e-mail é obrigatório.";
            campos.email.focus();
            return false;
        }

        if (senha || confirmarSenha) {
            if (senha.length < 6) {
                mensagem.textContent = "A nova senha deve ter pelo menos 6 caracteres.";
                campos.senha.focus();
                return false;
            }

            if (senha !== confirmarSenha) {
                mensagem.textContent = "As senhas não coincidem.";
                campos.confirmarSenha.focus();
                return false;
            }
        }
        return true;
    }

    async function salvarAlteracoes(event) {
        event.preventDefault();
        mensagem.textContent = "";
        mensagem.style.color = "#d62828";

        if (!validarFormulario()) return;

        const payload = {
            nome: campos.nome.value.trim(),
            email: campos.email.value.trim(),
        };

        if (campos.senha.value.trim()) {
            payload.senha = campos.senha.value.trim();
        }

        if (inputFoto.files[0]) {
            payload.foto = inputFoto.files[0].name;
        }

        try {
            console.log("Simulando envio para o backend:", payload);

            // SIMULAÇÃO DE SUCESSO:
            mensagem.style.color = "green";
            mensagem.textContent = "Alterações salvas com sucesso.";

            dadosOriginais.nome = payload.nome;
            dadosOriginais.email = payload.email;
            
            // Atualiza o localStorage com o novo nome
            localStorage.setItem("nome", payload.nome);
            if (nomeSidebar) nomeSidebar.textContent = payload.nome;

            if (previewFoto.src && previewFoto.style.display === "block") {
                fotoOriginal = previewFoto.src;
            }

            campos.senha.value = "";
            campos.confirmarSenha.value = "";
            inputFoto.value = "";
        } catch (error) {
            console.error(error);
            mensagem.style.color = "#d62828";
            mensagem.textContent = "Não foi possível salvar as alterações.";
        }
    }

    if (btnAlterarFoto) {
        btnAlterarFoto.addEventListener("click", () => {
            inputFoto.click();
        });
    }

    if (inputFoto) {
        inputFoto.addEventListener("change", (event) => {
            const arquivo = event.target.files[0];
            if (!arquivo) return;

            if (!arquivo.type.startsWith("image/")) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "Selecione um arquivo de imagem válido.";
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
            if (nomeSidebar) nomeSidebar.textContent = campos.nome.value.trim() || "Nome do usuário";
        });
    }

    if (btnCancelar) btnCancelar.addEventListener("click", restaurarFormulario);
    if (form) form.addEventListener("submit", salvarAlteracoes);

    preencherFormulario(adminMock);
    salvarEstadoOriginal(adminMock);
});