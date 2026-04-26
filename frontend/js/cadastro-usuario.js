document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const btnCancelar = document.getElementById("btn-cancelar");
    const mensagem = document.getElementById("mensagem-cadastro");
    const form = document.getElementById("form-cadastro-usuario");

    const campos = {
        nome: document.getElementById("nome"),
        email: document.getElementById("email"),
        matricula: document.getElementById("matricula"),
        cargo: document.getElementById("cargo"),
        setor: document.getElementById("setor"),
        tipoUsuario: document.getElementById("tipo_usuario"),
        senha: document.getElementById("senha"),
        confirmarSenha: document.getElementById("confirmar_senha")
    };

    // Ajuste: O sistema agora usa o Token para saber se alguém está logado
    const token = localStorage.getItem("token");
    if (!token) {
        // Se não tem crachá (token), volta para o login
        window.location.href = "./login.html";
    }

    // Se você salvou o nome do admin no login, podemos exibir aqui
    // Se não salvou, podemos deixar um padrão ou buscar do perfil
    nomeSidebar.textContent = "Administrador"; 

    function limparFormulario() {
        form.reset();
        mensagem.textContent = "";
    }

    function validarFormulario() {
        if (!campos.nome.value.trim()) {
            mensagem.textContent = "Informe o nome completo.";
            campos.nome.focus();
            return false;
        }
        if (!campos.email.value.trim()) {
            mensagem.textContent = "Informe o e-mail.";
            campos.email.focus();
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

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagem.textContent = "Cadastrando...";
        mensagem.style.color = "blue";

        if (!validarFormulario()) return;

        // Montando o pacote para o Chef (Backend)
        const payload = {
            nome: campos.nome.value.trim(),
            email: campos.email.value.trim(),
            senha: campos.senha.value,
            role: campos.tipoUsuario.value // O backend chama de 'role'
        };

        try {
            // ENVIANDO PARA O BACKEND
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Passando o crachá do admin
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                mensagem.style.color = "green";
                mensagem.textContent = "✅ Usuário cadastrado com sucesso!";
                form.reset();
            } else {
                mensagem.style.color = "#d62828";
                mensagem.textContent = data.message || "Erro ao cadastrar usuário.";
            }
        } catch (erro) {
            mensagem.style.color = "#d62828";
            mensagem.textContent = "❌ Erro de conexão com o servidor.";
            console.error("Erro no fetch:", erro);
        }
    });

    btnCancelar.addEventListener("click", limparFormulario);
});