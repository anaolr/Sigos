// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
//     ? "http://localhost:3000"
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------
  // 1. LÓGICA DE AUTO-LOGIN (Verificando Token)
  // --------------------------------------------------------
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    // Se já tem token e cargo salvos, manda direto pro painel certo
    switch (role) {
      case "gestor":
        window.location.href = "dashboard-gestor.html";
        break;
      case "admin":
        window.location.href = "dashboard-admin.html";
        break;
      default:
        window.location.href = "dashboard-funcionario.html";
    }
  }

  // --------------------------------------------------------
  // 2. VISIBILIDADE DA SENHA (O "Olhinho")
  // --------------------------------------------------------
  // CORREÇÃO: O seu HTML usa ID "toggle-senha", não a classe ".toggle-password"
  const togglePassword = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");

  if (togglePassword && senhaInput) {
    togglePassword.addEventListener("click", () => {
      const isPassword = senhaInput.getAttribute("type") === "password";
      senhaInput.setAttribute("type", isPassword ? "text" : "password");
      // O seu icone muda de olho aberto (fa-eye) para fechado (fa-eye-slash)
      togglePassword.classList.toggle("fa-eye-slash");
      togglePassword.classList.toggle("fa-eye");
    });
  }

  // --------------------------------------------------------
  // 3. LÓGICA DO FORMULÁRIO DE LOGIN (Conectando com o Backend)
  // --------------------------------------------------------
  const formLogin = document.getElementById("form-login");
  const mensagemErro = document.getElementById("mensagem-login");

  if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
      event.preventDefault(); // Impede a página de recarregar

      // Limpa mensagem de erro
      mensagemErro.textContent = "";

      // CORREÇÃO: Pegando o valor do campo "matricula", não "email"
      const matricula = document.getElementById("matricula").value.trim();
      const senha = senhaInput.value;

      if (!matricula || !senha) {
        mensagemErro.textContent = "Por favor, preencha a matrícula e a senha.";
        mensagemErro.style.color = "red";
        return;
      }

      mensagemErro.textContent = "Acessando...";
      mensagemErro.style.color = "blue";

      try {
        // ATENÇÃO AQUI: Como o seu front envia "matricula" e seu backend espera "email",
        // precisamos enviar a matrícula na propriedade "email" (se o admin foi criado usando o email no campo de email)
        // MAS como no passo anterior criamos o admin com email "admin@sigos.com" e matrícula "0000",
        // Vamos enviar a variável matricula, mas o backend atual espera o email no login.

        // Para evitar alterar o back agora, mande o que o usuário digitar na 'matricula'
        // disfarçado de 'email', pois o authController.js procura por 'email'.
        // (Você pode digitar 'admin@sigos.com' no campo de matrícula da tela para testar)
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: matricula, senha: senha }),
        });

        const data = await response.json();

        if (response.ok) {
          // Login com sucesso! Guardamos as credenciais no bolso
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("nome", data.nome);

          // Redireciona de acordo com o cargo
          if (data.role === "gestor") {
            window.location.href = "dashboard-gestor.html";
          } else if (data.role === "admin") {
            window.location.href = "dashboard-admin.html";
          } else {
            window.location.href = "dashboard-funcionario.html";
          }
        } else {
          // Erro retornado pelo backend
          mensagemErro.textContent = data.message || "Falha na autenticação.";
          mensagemErro.style.color = "red";
        }
      } catch (error) {
        console.error("Erro no login:", error);
        mensagemErro.textContent = "Erro ao conectar com o servidor.";
        mensagemErro.style.color = "red";
      }
    });
  }
});
