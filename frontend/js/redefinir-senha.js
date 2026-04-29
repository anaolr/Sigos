const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-nova-senha");
    const mensagem = document.getElementById("mensagem-senha");

    // "Apanhar" o token escondido no URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Se a pessoa abrir a página sem o token (escreveu no navegador), nós não deixamos fazer nada
    if (!token) {
        mensagem.style.color = "#d62828";
        mensagem.textContent = "Link de recuperação inválido ou inexistente.";
        if (form) {
            const btnSubmit = form.querySelector("button[type='submit']");
            if(btnSubmit) btnSubmit.disabled = true;
        }
        return;
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const novaSenha = document.getElementById("nova-senha").value;
            const confirmarSenha = document.getElementById("confirmar-senha").value;

            if (novaSenha.length < 6) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "A senha deve ter pelo menos 6 caracteres.";
                return;
            }

            if (novaSenha !== confirmarSenha) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "As senhas não coincidem.";
                return;
            }

            mensagem.style.color = "blue";
            mensagem.textContent = "A redefinir...";

            try {
                const response = await fetch(`${API_URL}/api/auth/redefinir-senha`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // Enviamos o token do URL junto com a senha nova!
                    body: JSON.stringify({ token, novaSenha })
                });

                const data = await response.json();

                if (response.ok) {
                    mensagem.style.color = "green";
                    mensagem.textContent = "Senha alterada! A redirecionar...";
                    form.reset();
                    
                    setTimeout(() => {
                        window.location.href = "./login.html";
                    }, 3000);
                } else {
                    mensagem.style.color = "#d62828";
                    mensagem.textContent = data.erro || "Token expirado ou inválido.";
                }
            } catch (error) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "Erro de conexão com o servidor.";
            }
        });
    }
});