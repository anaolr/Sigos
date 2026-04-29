// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
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

    let dadosOriginais = {};
    let fotoOriginal = "";

    async function carregarPerfil() {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const dadosUsuarioBanco = await response.json();
                preencherFormulario(dadosUsuarioBanco);
                salvarEstadoOriginal(dadosUsuarioBanco);
            }
        } catch (erro) {
            console.error("Erro de conexão ao buscar perfil:", erro);
        }
    }

    function preencherFormulario(dados) {
      if(campos.nome) campos.nome.value = dados.nome || "";
      if(campos.matricula) campos.matricula.value = dados.matricula || "";
      if(campos.email) campos.email.value = dados.email || "";
      if(campos.tipoUsuario) campos.tipoUsuario.value = "Gestor";
      if(campos.cargo) campos.cargo.value = dados.cargo || "N/A";
      if(campos.setor) campos.setor.value = dados.setor || "N/A";
      if(campos.senha) campos.senha.value = "";
      if(campos.confirmarSenha) campos.confirmarSenha.value = "";

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
      inputFoto.value = "";

      if (fotoOriginal) {
        previewFoto.src = `${API_URL}/uploads/${fotoOriginal}`;
        previewFoto.style.display = "block";
        iconeFoto.style.display = "none";
      } else {
        previewFoto.src = "";
        previewFoto.style.display = "none";
        iconeFoto.style.display = "block";
      }
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

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      mensagem.textContent = "Salvando...";
      mensagem.style.color = "blue";

      if (!validarFormulario()) {
          mensagem.style.color = "#d62828";
          return;
      }

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
              headers: { "Authorization": `Bearer ${token}` },
              body: formData
          });

          if (response.ok) {
              const dadosSalvos = await response.json();
              mensagem.style.color = "green";
              mensagem.textContent = "Alterações salvas com sucesso!";
              nomeSidebar.textContent = dadosSalvos.nome;
              localStorage.setItem("nome", dadosSalvos.nome);
              campos.senha.value = "";
              campos.confirmarSenha.value = "";
          } else {
              throw new Error("Erro ao salvar");
          }
      } catch (e) {
          mensagem.style.color = "#d62828";
          mensagem.textContent = "Erro ao comunicar com o servidor.";
      }
    });

    if(btnAlterarFoto) btnAlterarFoto.addEventListener("click", () => inputFoto.click());

    if(inputFoto) inputFoto.addEventListener("change", (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo || !arquivo.type.startsWith("image/")) return;
      const leitor = new FileReader();
      leitor.onload = function (e) {
        previewFoto.src = e.target.result;
        previewFoto.style.display = "block";
        iconeFoto.style.display = "none";
      };
      leitor.readAsDataURL(arquivo);
    });

    if(btnCancelar) btnCancelar.addEventListener("click", restaurarFormulario);

    carregarPerfil();
});