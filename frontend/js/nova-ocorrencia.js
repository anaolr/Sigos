const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://sigos-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "funcionario") {
        localStorage.clear();
        window.location.href = "./login.html";
        return;
    }

    const campoDataEnvio = document.getElementById("data-envio");
    const campoSetorOrigem = document.getElementById("setor-origem");
    const nomeSidebar = document.getElementById("nome-sidebar");
    const btnSair = document.getElementById("btn-logout");

    // ==========================================
    // CORREÇÃO: VARIÁVEIS DA PRÉVIA DA IMAGEM
    // ==========================================
    const previewContainer = document.getElementById("preview-container");
    const previewAnexo = document.getElementById("preview-anexo");
    const inputAnexo = document.getElementById("anexo");

    // Lógica de Logout
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "./login.html";
        });
    }

    function formatarDataAtual() {
        const agora = new Date();
        return `${String(agora.getDate()).padStart(2, "0")}/${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()} às ${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
    }
    if(campoDataEnvio) campoDataEnvio.value = formatarDataAtual();

    // Busca os dados do usuário para preencher Nome e Setor
    async function carregarUsuario() {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const dados = await response.json();
                if(nomeSidebar) nomeSidebar.textContent = dados.nome;
                if(campoSetorOrigem) campoSetorOrigem.value = dados.setor || "Geral";
            }
        } catch (e) { console.error("Erro ao carregar setor", e); }
    }
    carregarUsuario();

    // ==========================================
    // CORREÇÃO: MOSTRAR PRÉVIA DA IMAGEM
    // ==========================================
    if (inputAnexo) {
        inputAnexo.addEventListener("change", (event) => {
            const arquivo = event.target.files[0];
            if (!arquivo || !arquivo.type.startsWith("image/")) {
                if(previewContainer) previewContainer.style.display = "none";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewAnexo) previewAnexo.src = e.target.result;
                if (previewContainer) previewContainer.style.display = "block";
            };
            reader.readAsDataURL(arquivo);
        });
    }

    // Envio do formulário
    const form = document.getElementById("form-ocorrencia");
    const mensagem = document.getElementById("mensagem-formulario");

    if(form) form.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagem.style.color = "blue";
        mensagem.textContent = "A enviar...";

        const formData = new FormData();
        formData.append("titulo", document.getElementById("titulo").value.trim());
        formData.append("descricao", document.getElementById("descricao").value.trim());
        formData.append("categoria", document.getElementById("categoria").value);
        formData.append("setorOrigem", document.getElementById("setor-origem").value);
        formData.append("setorResponsavel", document.getElementById("setor-responsavel").value);
        formData.append("local", document.getElementById("local").value.trim());
        formData.append("urgencia", document.getElementById("urgencia").value);
        formData.append("status", "Aberta");

        if (inputAnexo && inputAnexo.files[0]) {
            formData.append("anexo", inputAnexo.files[0]); 
        }

        try {
            const response = await fetch(`${API_URL}/api/ocorrencias`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData 
            });

            if(response.ok) {
                mensagem.style.color = "green";
                mensagem.textContent = "Ocorrência enviada com sucesso!";
                form.reset();
                if(campoDataEnvio) campoDataEnvio.value = formatarDataAtual();
                if(previewContainer) previewContainer.style.display = "none"; // Agora funciona perfeitamente!
            } else {
                throw new Error("Erro ao salvar no servidor.");
            }
        } catch(erro) {
            console.error("Erro detetado:", erro);
            mensagem.style.color = "#d62828";
            mensagem.textContent = "Erro de conexão.";
        }
    });
});