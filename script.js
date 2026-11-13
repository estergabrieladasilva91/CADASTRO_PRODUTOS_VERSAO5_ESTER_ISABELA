
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

const CHAVE_STORAGE = "sistema_estoque_produtos";

let listaDeProdutos = [];
let indiceEdicao = null;
let acaoPendente = null;

const formulario = document.getElementById("produto-form");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const tabelaProdutos = document.getElementById("tabela-produtos");
const campoBusca = document.getElementById("campo-busca");
const totalEstoque = document.getElementById("total-estoque");

const mensagemErro = document.getElementById("mensagem-erro");
const mensagemVazia = document.getElementById("mensagem-vazia");
const sugestoesProdutos = document.getElementById("sugestoes-produtos");

const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelarEdicao = document.getElementById("botao-cancelar-edicao");
const botaoLimpar = document.getElementById("limpar-tabela");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const tituloConfirmacao = document.getElementById("titulo-confirmacao");
const textoConfirmacao = document.getElementById("texto-confirmacao");

const botaoCancelarModal = document.getElementById("botao-cancelar-modal");
const botaoConfirmarModal = document.getElementById("botao-confirmar-modal");

const modalBootstrap = document.getElementById("modal-bootstrap");
const botaoBootstrap = document.getElementById("botao-bootstrap");
const fecharBootstrap = document.getElementById("fechar-bootstrap");
const botaoEntendi = document.getElementById("botao-entendi");

// CARREGAR DADOS SALVOS

function carregarProdutos() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
            const produtos = JSON.parse(dadosSalvos);

            if (Array.isArray(produtos)) {
                listaDeProdutos = produtos.map(produto =>
                    new Produto(
                        produto.nome,
                        Number(produto.preco),
                        Number(produto.quantidade)
                    )
                );
            }
        }
    } catch (erro) {
        listaDeProdutos = [];
        mostrarErro("Não foi possível carregar os produtos salvos.");
    }

    atualizarTela();
}

// SALVAR NO LOCALSTORAGE

function salvarNoStorage() {
    try {
        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(listaDeProdutos)
        );
    } catch (erro) {
        mostrarErro("Não foi possível salvar os produtos no navegador.");
    }
}

// MENSAGEM DE ERRO

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.classList.add("visivel");
}

function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.classList.remove("visivel");
}

// LIMPAR FORMULÁRIO

function limparFormulario() {
    formulario.reset();
    indiceEdicao = null;

    botaoSalvar.innerHTML = "<span>＋</span> Adicionar produto";
    botaoCancelarEdicao.hidden = true;
}

// CADASTRAR OU EDITAR PRODUTO

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();
    limparErro();

    const nome = campoNome.value.trim();
    const preco = Number(campoPreco.value);
    const quantidade = Number(campoQuantidade.value);

    if (!nome || nome.length > 80) {
        mostrarErro("Digite um nome válido com até 80 caracteres.");
        campoNome.focus();
        return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
        mostrarErro("Digite um preço válido maior que zero.");
        campoPreco.focus();
        return;
    }

    if (
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        mostrarErro("Digite uma quantidade inteira maior que zero.");
        campoQuantidade.focus();
        return;
    }

    const produto = new Produto(nome, preco, quantidade);

    if (indiceEdicao === null) {
        listaDeProdutos.push(produto);
    } else {
        listaDeProdutos[indiceEdicao] = produto;
    }

    salvarNoStorage();
    limparFormulario();
    atualizarTela();
});

// PREPARAR EDIÇÃO

function editarProduto(indice) {
    const produto = listaDeProdutos[indice];

    if (!produto) return;

    indiceEdicao = indice;

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    botaoSalvar.innerHTML = "Salvar alterações";
    botaoCancelarEdicao.hidden = false;

    limparErro();

    campoNome.focus();
    formulario.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// CANCELAR EDIÇÃO

botaoCancelarEdicao.addEventListener("click", function() {
    limparFormulario();
    limparErro();
});

// ABRIR MODAL DE CONFIRMAÇÃO

function abrirModal(titulo, mensagem, acao) {
    tituloConfirmacao.textContent = titulo;
    textoConfirmacao.textContent = mensagem;

    acaoPendente = acao;

    modalConfirmacao.classList.add("aberto");
    modalConfirmacao.setAttribute("aria-hidden", "false");

    botaoCancelarModal.focus();
}

// FECHAR MODAL DE CONFIRMAÇÃO

function fecharModal() {
    modalConfirmacao.classList.remove("aberto");
    modalConfirmacao.setAttribute("aria-hidden", "true");

    acaoPendente = null;
}

// CONFIRMAR AÇÃO

botaoConfirmarModal.addEventListener("click", function() {
    if (typeof acaoPendente === "function") {
        const acao = acaoPendente;
        fecharModal();
        acao();
    }
});

botaoCancelarModal.addEventListener("click", fecharModal);

// EXCLUIR PRODUTO

function solicitarExclusao(indice) {
    abrirModal(
        "Excluir produto?",
        "Essa ação não poderá ser desfeita. Deseja realmente excluir este produto?",
        function() {
            listaDeProdutos.splice(indice, 1);

            if (indiceEdicao === indice) {
                limparFormulario();
            } else if (indiceEdicao !== null && indiceEdicao > indice) {
                indiceEdicao--;
            }

            salvarNoStorage();
            atualizarTela();
        }
    );
}

// LIMPAR TODO O ESTOQUE

botaoLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        mostrarErro("Não existem produtos para limpar.");
        return;
    }

    abrirModal(
        "Limpar estoque?",
        "Todos os produtos cadastrados serão excluídos permanentemente. Deseja continuar?",
        function() {
            listaDeProdutos = [];

            limparFormulario();
            limparErro();

            salvarNoStorage();
            atualizarTela();
        }
    );
});

// PESQUISA DINÂMICA

campoBusca.addEventListener("input", function() {
    atualizarTela();
});

// ATUALIZAR SUGESTÕES DO AUTOCOMPLETE

function atualizarSugestoes() {
    sugestoesProdutos.innerHTML = "";

    const nomes = [
        ...new Set(
            listaDeProdutos.map(produto => produto.nome)
        )
    ];

    nomes.forEach(nome => {
        const opcao = document.createElement("option");
        opcao.value = nome;
        sugestoesProdutos.appendChild(opcao);
    });
}

// ATUALIZAR TELA

function atualizarTela() {
    const termoBusca = campoBusca.value
        .trim()
        .toLowerCase();

    const produtosFiltrados = listaDeProdutos
        .map((produto, indice) => ({
            produto,
            indice
        }))
        .filter(item =>
            item.produto.nome
                .toLowerCase()
                .includes(termoBusca)
        );

    renderizarTabela(produtosFiltrados);

    // REDUCE: soma as quantidades dos produtos filtrados
    const total = produtosFiltrados.reduce(
        (soma, item) => soma + item.produto.quantidade,
        0
    );

    totalEstoque.textContent = total;

    atualizarSugestoes();
}

// RENDERIZAR TABELA

function renderizarTabela(produtos) {
    tabelaProdutos.innerHTML = "";

    mensagemVazia.classList.toggle(
        "visivel",
        produtos.length === 0
    );

    produtos.forEach(item => {
        const produto = item.produto;
        const indice = item.indice;

        const linha = document.createElement("tr");

        const colunaNome = document.createElement("td");
        colunaNome.className = "nome-produto";
        colunaNome.textContent = produto.nome;

        const colunaPreco = document.createElement("td");
        colunaPreco.textContent = formatarMoeda(produto.preco);

        const colunaQuantidade = document.createElement("td");
        colunaQuantidade.textContent = produto.quantidade;

        const colunaSubtotal = document.createElement("td");
        colunaSubtotal.className = "subtotal";
        colunaSubtotal.textContent = formatarMoeda(
            produto.calcularSubtotal()
        );

        const colunaAcoes = document.createElement("td");
        const grupoAcoes = document.createElement("div");
        grupoAcoes.className = "acoes";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao-editar";
        botaoEditar.textContent = "Editar";
        botaoEditar.addEventListener("click", function() {
            editarProduto(indice);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", function() {
            solicitarExclusao(indice);
        });

        grupoAcoes.append(botaoEditar, botaoExcluir);
        colunaAcoes.appendChild(grupoAcoes);

        linha.append(
            colunaNome,
            colunaPreco,
            colunaQuantidade,
            colunaSubtotal,
            colunaAcoes
        );

        tabelaProdutos.appendChild(linha);
    });
}

// FORMATAR VALORES EM REAIS

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// MODAL CONCEITO BOOTSTRAP

function abrirModalBootstrap() {
    modalBootstrap.classList.add("aberto");
    modalBootstrap.setAttribute("aria-hidden", "false");

    botaoEntendi.focus();
}

function fecharModalBootstrap() {
    modalBootstrap.classList.remove("aberto");
    modalBootstrap.setAttribute("aria-hidden", "true");
}

botaoBootstrap.addEventListener("click", abrirModalBootstrap);
fecharBootstrap.addEventListener("click", fecharModalBootstrap);
botaoEntendi.addEventListener("click", fecharModalBootstrap);

// FECHAR MODAIS CLICANDO FORA

modalConfirmacao.addEventListener("click", function(evento) {
    if (evento.target === modalConfirmacao) {
        fecharModal();
    }
});

modalBootstrap.addEventListener("click", function(evento) {
    if (evento.target === modalBootstrap) {
        fecharModalBootstrap();
    }
});

// FECHAR MODAIS COM ESC

document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
        fecharModal();
        fecharModalBootstrap();
    }
});

// INICIAR SISTEMA

carregarProdutos();
