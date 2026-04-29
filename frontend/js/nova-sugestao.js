// const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
//     ? "http://localhost:3000" 
//     : "https://sigos-production.up.railway.app";

const API_URL = "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const nome = localStorage.getItem("nome");

    if (!token || role !== "funcionario") {
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

    const form = document.getElementById("form-sugestao");
    const mensagem = document.getElementById("mensagem-formulario");
    const btnCancelar = document.getElementById("btn-cancelar");
    const inputAnexo = document.getElementById("anexo");
    const previewContainer = document.getElementById("preview-container");
    const previewAnexo = document.getElementById("preview-anexo");
    const campoDataEnvio = document.getElementById("data-envio");

    function formatarDataAtual() {
        const agora = new Date();
        const dia = String(agora.getDate()).padStart(2, "0");
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const ano = agora.getFullYear();
        const horas = String(agora.getHours()).padStart(2, "0");
        const minutos = String(agora.getMinutes()).padStart(2, "0");
        return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    }

    if(campoDataEnvio) campoDataEnvio.value = formatarDataAtual();

    if(inputAnexo) inputAnexo.addEventListener("change", (event) => {
        const arquivo = event.target.files[0];
        if (!arquivo || !arquivo.type.startsWith("image/")) {
            if(previewContainer) previewContainer.style.display = "none";
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            previewAnexo.src = e.target.result;
            previewContainer.style.display = "block";
        };
        reader.readAsDataURL(arquivo);
    });

    if(form) form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagem.style.color = "blue";
        mensagem.textContent = "A enviar...";

        // Usamos FormData para suportar envio de ficheiros
        const formData = new FormData();
        formData.append("titulo", document.getElementById("titulo").value.trim());
        formData.append("descricao", document.getElementById("descricao").value.trim());
        formData.append("setor", document.getElementById("setor-destino").value); // Igual ao Model Sugestao
        formData.append("beneficio", document.getElementById("beneficio").value.trim()); // Igual ao Model Sugestao
        formData.append("status", "Enviada"); // A maiúscula exigida pelo Sequelize

        // Adiciona a imagem se ela existir
        if (inputAnexo && inputAnexo.files[0]) {
            formData.append("anexo", inputAnexo.files[0]);
        }

        try {
            const response = await fetch(`${API_URL}/api/sugestoes`, {
                method: "POST",
                headers: {
                    // Sem "Content-Type" quando se usa FormData!
                    "Authorization": `Bearer ${token}`
                },
                body: formData // Envia o pacote completo
            });

            if(response.ok) {
                mensagem.style.color = "green";
                mensagem.textContent = "Sugestão enviada com sucesso!";
                form.reset();
                if(campoDataEnvio) campoDataEnvio.value = formatarDataAtual();
                if(previewContainer) previewContainer.style.display = "none";
            } else {
                const erroServidor = await response.json();
                throw new Error(erroServidor.erro || "Erro do servidor");
            }
        } catch(erro) {
            mensagem.style.color = "#d62828";
            mensagem.textContent = "Erro de conexão: " + erro.message;
            console.error(erro);
        }
    });

    if(btnCancelar) btnCancelar.addEventListener("click", () => {
        window.location.href = "./minhas-solicitacoes.html";
    });
});