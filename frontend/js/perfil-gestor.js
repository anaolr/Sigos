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
    const form = document.getElementById("form-perfil-gestor");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnAlterarFoto = document.getElementById("btn-alterar-foto");
    const inputFoto = document.getElementById("input-foto");
    const previewFoto = document.getElementById("preview-foto");
    const iconeFoto = document.getElementById("icone-foto");
    const mensagem = document.getElementById("mensagem-perfil");

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

    // Criamos um gestor mock básico para não quebrar a tela enquanto não liga ao back-end
    const gestorMock = {
        nome: nome,
        matricula: "0000", // Aqui no futuro virá do fetch ao backend
        email: "gestor@email.com",
        tipo_usuario: "Gestor",
        cargo: "Gestão",
        setor: "TI"
    };

    let dadosOriginais = {};
    let fotoOriginal = "";

    function preencherFormulario(dados) {
      if(campos.nome) campos.nome.value = dados.nome || "";
      if(campos.matricula) campos.matricula.value = dados.matricula || "";
      if(campos.email) campos.email.value = dados.email || "";
      if(campos.tipoUsuario) campos.tipoUsuario.value = dados.tipo_usuario || "";
      if(campos.cargo) campos.cargo.value = dados.cargo || "";
      if(campos.setor) campos.setor.value = dados.setor || "";
      if(campos.senha) campos.senha.value = "";
      if(campos.confirmarSenha) campos.confirmarSenha.value = "";

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
      dadosOriginais = { nome: dados.nome || "", email: dados.email || "" };
      fotoOriginal = dados.foto || "";
    }

    function restaurarFormulario() {
      campos.nome.value = dadosOriginais.nome || "";
      campos.email.value = dadosOriginais.email || "";
      campos.senha.value = "";
      campos.confirmarSenha.value = "";
      nomeSidebar.textContent = dadosOriginais.nome || "Nome do usuário";
      mensagem.textContent = "";

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
      const nomeVal = campos.nome.value.trim();
      const emailVal = campos.email.value.trim();
      const senhaVal = campos.senha.value;
      const confirmarSenhaVal = campos.confirmarSenha.value;

      if (!nomeVal) { mensagem.textContent = "O nome é obrigatório."; return false; }
      if (!emailVal) { mensagem.textContent = "O e-mail é obrigatório."; return false; }
      if (senhaVal || confirmarSenhaVal) {
        if (senhaVal.length < 6) { mensagem.textContent = "A nova senha deve ter pelo menos 6 caracteres."; return false; }
        if (senhaVal !== confirmarSenhaVal) { mensagem.textContent = "As senhas não coincidem."; return false; }
      }
      return true;
    }

    async function salvarAlteracoes(event) {
      event.preventDefault();
      mensagem.textContent = "";
      if (!validarFormulario()) return;

      mensagem.style.color = "green";
      mensagem.textContent = "Alterações salvas com sucesso.";
      dadosOriginais.nome = campos.nome.value.trim();
      dadosOriginais.email = campos.email.value.trim();
      nomeSidebar.textContent = dadosOriginais.nome;
      
      // Atualiza também no localStorage para manter a coerência visual
      localStorage.setItem("nome", dadosOriginais.nome);

      if (previewFoto.src && previewFoto.style.display === "block") {
        fotoOriginal = previewFoto.src;
      }
      campos.senha.value = "";
      campos.confirmarSenha.value = "";
      inputFoto.value = "";
    }

    btnAlterarFoto.addEventListener("click", () => inputFoto.click());

    inputFoto.addEventListener("change", (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo) return;
      if (!arquivo.type.startsWith("image/")) {
        mensagem.style.color = "#d62828";
        mensagem.textContent = "Selecione um arquivo de imagem válido.";
        inputFoto.value = ""; return;
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

    campos.nome.addEventListener("input", () => {
      nomeSidebar.textContent = campos.nome.value.trim() || "Nome do usuário";
    });

    btnCancelar.addEventListener("click", restaurarFormulario);
    form.addEventListener("submit", salvarAlteracoes);

    preencherFormulario(gestorMock);
    salvarEstadoOriginal(gestorMock);
});