const dados = {
  ocorrencias: {
    alta: 12,
    media: 8,
    baixa: 1
  },

  indicadores: {
    tempo: "2 dias",
    setor: "Produção",
    sugestoesAnalise: 5
  },

  alerta: {
    setor: "Produção",
    local: "Fábrica 1",
    prioridade: "Alta"
  },

  resumo: {
    criticas: 2,
    andamento: 23,
    abertas: 150,
    resolvidas: 75
  }
};

const sugestoesDestaqueAdmin = [
  {
    id: 1,
    titulo: "Adicionar micro-ondas na copa",
    descricao:
      "Muitos funcionários almoçam na empresa e atualmente existe apenas um micro-ondas para todo o andar.",
    setor: "Administrativo",
    votosPositivos: 167,
    votosNegativos: 13,
    status: "em_analise"
  },

  {
    id: 2,
    titulo: "Melhorar rede Wi-Fi",
    descricao:
      "A internet cai com frequência no segundo andar e isso atrapalha o trabalho da equipe.",
    setor: "TI",
    votosPositivos: 98,
    votosNegativos: 7,
    status: "em_analise"
  }
];

function atualizarDashboard() {
  document.getElementById("alta").innerText = dados.ocorrencias.alta;
  document.getElementById("media").innerText = dados.ocorrencias.media;
  document.getElementById("baixa").innerText = dados.ocorrencias.baixa;

  document.getElementById("tempo").innerText = dados.indicadores.tempo;
  document.getElementById("setor").innerText = dados.indicadores.setor;
  document.getElementById("sugestoes_analise").innerText =
    dados.indicadores.sugestoesAnalise;

  document.getElementById("alertaSetor").innerText = dados.alerta.setor;
  document.getElementById("alertaLocal").innerText = dados.alerta.local;
  document.getElementById("alertaPrioridade").innerText =
    dados.alerta.prioridade;

  document.getElementById(
    "criticas"
  ).innerText = `${dados.resumo.criticas} Críticas`;

  document.getElementById(
    "andamento"
  ).innerText = `${dados.resumo.andamento} Em andamento`;

  document.getElementById(
    "abertas"
  ).innerText = `${dados.resumo.abertas} Abertas`;

  document.getElementById(
    "resolvidas"
  ).innerText = `${dados.resumo.resolvidas} Resolvidas`;
}

function formatarStatus(status) {
  const mapa = {
    em_analise: "Em análise",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada"
  };

  return mapa[status] || status;
}

function classeStatus(status) {
  const mapa = {
    em_analise: "andamento",
    aprovada: "resolvida",
    rejeitada: "alta"
  };

  return mapa[status] || "andamento";
}

function renderizarSugestoesDestaqueAdmin() {
  const lista = document.getElementById("lista-sugestoes-destaque-admin");
  const resumo = document.getElementById("resumo-votacao-admin");

  if (!lista || !resumo) return;

  lista.innerHTML = "";

  sugestoesDestaqueAdmin.forEach((sugestao) => {
    const article = document.createElement("article");
    article.classList.add("sugestao-destaque-admin");

    article.innerHTML = `
      <div class="sugestao-topo-admin">
        <span class="tag-setor-admin">
          ${sugestao.setor}
        </span>

        <span class="votos-admin">
          <i class="fa-solid fa-thumbs-up"></i>
          ${sugestao.votosPositivos}
        </span>
      </div>

      <h4>${sugestao.titulo}</h4>

      <p>${sugestao.descricao}</p>

      <span class="tag status-sugestao-admin ${classeStatus(sugestao.status)}">
        ${formatarStatus(sugestao.status)}
      </span>
    `;

    lista.appendChild(article);
  });

  const totalPositivos = sugestoesDestaqueAdmin.reduce(
    (acc, item) => acc + item.votosPositivos,
    0
  );

  const totalNegativos = sugestoesDestaqueAdmin.reduce(
    (acc, item) => acc + item.votosNegativos,
    0
  );

  resumo.innerHTML = `
    <span>
      <i class="fa-solid fa-thumbs-up"></i>
      ${totalPositivos}
    </span>

    <span>
      <i class="fa-solid fa-thumbs-down"></i>
      ${totalNegativos}
    </span>
  `;
}

let grafico = null;

function criarGrafico() {
  const ctx = document.getElementById("graficoPizza");

  if (!ctx) return;

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "pie",

    data: {
      labels: ["Alta", "Média", "Baixa"],

      datasets: [
        {
          data: [
            dados.ocorrencias.alta,
            dados.ocorrencias.media,
            dados.ocorrencias.baixa
          ],

          backgroundColor: ["#f5b5b5", "#fff1b8", "#c8f0d2"],

          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: "#333",
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

function iniciar() {
  // 1. Verificando as Credenciais
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const nome = localStorage.getItem("nome");

  // Se não tiver token, manda de volta para o login
  if (!token) {
    window.location.href = "login.html";
    return; // Para a execução do código aqui
  }

  // 2. Colocar o nome real da pessoa na tela
  const nomeSidebar = document.getElementById("nome-sidebar");
  const tituloBoasVindas = document.getElementById("boas-vindas-nome");

  if (nome) {
    if (nomeSidebar) nomeSidebar.textContent = nome;
    if (tituloBoasVindas) tituloBoasVindas.textContent = `Olá, ${nome} 👋`;
  }

  // 3. Lógica do botão de LOGOUT
  const btnSair = document.getElementById("btn-logout");
  if (btnSair) {
    btnSair.addEventListener("click", (event) => {
      event.preventDefault(); // Impede o botão de fazer algo automático
      
      // Apaga todos os dados da sessão (O Crachá)
      localStorage.clear(); 
      
      // Manda pro login
      window.location.href = "./login.html";
    });
  }

  // 4. Iniciar o restante da página
  atualizarDashboard();
  renderizarSugestoesDestaqueAdmin();
  criarGrafico();
}

document.addEventListener("DOMContentLoaded", iniciar);