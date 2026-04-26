document.addEventListener("DOMContentLoaded", () => {
    const nomeSidebar = document.getElementById("nome-sidebar");
    const form = document.getElementById("form-ocorrencia");
    const mensagem = document.getElementById("mensagem-formulario");
    const btnCancelar = document.getElementById("btn-cancelar");
    const inputAnexo = document.getElementById("anexo");
    const previewContainer = document.getElementById("preview-container");
    const previewAnexo = document.getElementById("preview-anexo");
    const campoDataEnvio = document.getElementById("data-envio");
    const campoSetorOrigem = document.getElementById("setor-origem");

    const usuarioString = localStorage.getItem("usuarioLogado");
    if (!usuarioString) {
        window.location.href = "./login.html";
    }
    const usuario = JSON.parse(usuarioString);
    
    nomeSidebar.textContent = usuario.nome;
    campoSetorOrigem.value = usuario.setor;

    function formatarDataAtual() {
        const agora = new Date();

        const dia = String(agora.getDate()).padStart(2, "0");
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const ano = agora.getFullYear();

        const horas = String(agora.getHours()).padStart(2, "0");
        const minutos = String(agora.getMinutes()).padStart(2, "0");

        return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
    }

    campoDataEnvio.value = formatarDataAtual();

    inputAnexo.addEventListener("change", (event) => {
        const arquivo = event.target.files[0];

        if (!arquivo) {
            previewContainer.style.display = "none";
            previewAnexo.src = "";
            return;
        }

        if (!arquivo.type.startsWith("image/")) {
            mensagem.style.color = "#d62828";
            mensagem.textContent = "Selecione apenas imagens.";
            inputAnexo.value = "";
            previewContainer.style.display = "none";
            previewAnexo.src = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            previewAnexo.src = e.target.result;
            previewContainer.style.display = "block";
        };

        reader.readAsDataURL(arquivo);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        mensagem.style.color = "#d62828";
        mensagem.textContent = "";

        const dados = {
            titulo: document.getElementById("titulo").value.trim(),
            categoria: document.getElementById("categoria").value,
            setorOrigem: campoSetorOrigem.value,
            setorResponsavel: document.getElementById("setor-responsavel").value,
            local: document.getElementById("local").value.trim(),
            urgencia: document.getElementById("urgencia").value,
            dataEnvio: campoDataEnvio.value,
            descricao: document.getElementById("descricao").value.trim(),
            anexo: inputAnexo.files[0] ? inputAnexo.files[0].name : null
        };

        if (
            !dados.titulo ||
            !dados.categoria ||
            !dados.setorResponsavel ||
            !dados.local ||
            !dados.urgencia ||
            !dados.descricao
        ) {
            mensagem.textContent = "Preencha todos os campos obrigatórios.";
            return;
        }

        console.log("Ocorrência enviada:", dados);

        mensagem.style.color = "green";
        mensagem.textContent = "Ocorrência enviada com sucesso.";

        form.reset();

        campoSetorOrigem.value = usuario.setor;
        campoDataEnvio.value = formatarDataAtual();

        previewContainer.style.display = "none";
        previewAnexo.src = "";
    });

    btnCancelar.addEventListener("click", () => {
        window.location.href = "./minhas-solicitacoes.html";
    });
});