const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-recuperacao");
    const mensagem = document.getElementById("mensagem-recuperacao");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const btnSubmit = form.querySelector("button[type='submit']");

            mensagem.style.color = "blue";
            mensagem.textContent = "A enviar e-mail...";
            btnSubmit.disabled = true;

            try {
                const response = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    mensagem.style.color = "green";
                    mensagem.textContent = data.mensagem;
                    form.reset();
                } else {
                    mensagem.style.color = "#d62828";
                    mensagem.textContent = data.erro || "Erro ao solicitar recuperação.";
                }
            } catch (error) {
                mensagem.style.color = "#d62828";
                mensagem.textContent = "Erro de ligação com o servidor.";
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }
});