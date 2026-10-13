/* ==========================================================
   Costa Dourada Imóveis — projeto demonstrativo (Ponto Web)
   ========================================================== */

/* >>> Para ativar o WhatsApp, coloque o número real aqui,
   com código do país e DDD, só dígitos. Exemplo: "5573900000000".
   Enquanto estiver vazio, os botões mostram um aviso. <<< */
const WHATSAPP_NUMBER = "";

/* Dados dos anúncios demonstrativos e fictícios (usados na janela de detalhes) */
const IMOVEIS = {
  atlantico: {
    nome: "Casa Atlântico",
    meta: "Venda · São Miguel, Ilhéus",
    preco: "R$ 1.850.000",
    texto: "Casa com 4 quartos, piscina, jardim tropical e área gourmet, pensada para receber a família e os amigos.",
  },
  mare: {
    nome: "Residencial Maré Alta",
    meta: "Venda · Zona Sul, Ilhéus",
    preco: "R$ 680.000",
    texto: "Apartamento com 2 quartos, varanda com vista para o mar e área de lazer no condomínio.",
  },
  refugio: {
    nome: "Refúgio da Mata",
    meta: "Aluguel por temporada · Itacaré, Bahia",
    preco: "R$ 850 por noite",
    texto: "Casa com 3 quartos e piscina privativa, integrada à natureza, para temporadas de descanso.",
  },
};

document.documentElement.classList.add("js");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Aviso rápido (toast) ---------- */
const toast = $("#toast");
let toastTimer;
function aviso(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
}

/* ---------- WhatsApp ---------- */
function abrirWhatsApp(mensagem) {
  const numero = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!numero) {
    aviso("Demonstração: adicione o número real na constante WHATSAPP_NUMBER do arquivo script.js.");
    return;
  }
  const url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
  window.open(url, "_blank", "noopener");
}
$$("[data-whatsapp]").forEach((btn) =>
  btn.addEventListener("click", () => abrirWhatsApp(btn.dataset.whatsapp))
);

/* ---------- Menu mobile ---------- */
const menuBtn = $("#menuBtn");
const nav = $("#nav");
function fecharMenu() {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Abrir menu");
}
menuBtn.addEventListener("click", () => {
  const aberto = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(aberto));
  menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});
$$("a", nav).forEach((a) => a.addEventListener("click", fecharMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharMenu();
});

/* ---------- Filtros ---------- */
const fLocal = $("#fLocal");
const fTipo = $("#fTipo");
const fPreco = $("#fPreco");
const cards = $$(".property");
const vazio = $("#empty");
const contagem = $("#resultCount");

function faixaDoImovel(card) {
  const preco = Number(card.dataset.preco);
  const limite = card.dataset.tipo === "temporada" ? 1000 : 1000000;
  return preco <= limite ? "entrada" : "alto";
}

function filtrar() {
  let visiveis = 0;
  cards.forEach((card) => {
    const ok =
      (fLocal.value === "todos" || card.dataset.local === fLocal.value) &&
      (fTipo.value === "todos" || card.dataset.tipo === fTipo.value) &&
      (fPreco.value === "todos" || faixaDoImovel(card) === fPreco.value);
    card.hidden = !ok;
    if (ok) {
      visiveis++;
      card.classList.add("visible"); // garante que apareça mesmo antes da animação
    }
  });
  vazio.hidden = visiveis > 0;
  contagem.textContent =
    visiveis === 0
      ? ""
      : visiveis === 1
      ? "1 imóvel encontrado"
      : visiveis + " imóveis encontrados";
}

[fLocal, fTipo, fPreco].forEach((el) => el.addEventListener("change", filtrar));

/* Botão "Buscar imóveis" */
$("#busca").addEventListener("submit", (e) => {
  e.preventDefault();
  filtrar();
  $("#imoveis").scrollIntoView({ behavior: "smooth" });
});

/* Limpar filtros */
$("#clearFilters").addEventListener("click", () => {
  fLocal.value = fTipo.value = fPreco.value = "todos";
  filtrar();
});

/* Links "Comprar", "Alugar" e "Explorar imóveis" aplicam o filtro de tipo */
$$("[data-filter-type]").forEach((link) =>
  link.addEventListener("click", () => {
    fTipo.value = link.dataset.filterType;
    filtrar();
  })
);

/* ---------- Janela de detalhes ---------- */
const modal = $("#modal");
let imovelAtual = null;
$$("[data-details]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const item = IMOVEIS[btn.dataset.details];
    if (!item) return;
    imovelAtual = item;
    $("#mTitle").textContent = item.nome;
    $("#mMeta").textContent = item.meta;
    $("#mText").textContent = item.texto;
    $("#mPrice").textContent = item.preco;
    modal.showModal();
  })
);
$("#modalClose").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close(); // clique fora fecha
});
$("#mWhats").addEventListener("click", () => {
  if (imovelAtual) abrirWhatsApp("Olá! Tenho interesse em " + imovelAtual.nome + " (anúncio demonstrativo).");
});

/* ---------- Animação de entrada dos anúncios ---------- */
const reveals = $$(".reveal");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          obs.unobserve(en.target);
        }
      }),
    { threshold: 0.15 }
  );
  reveals.forEach((el) => obs.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("visible"));
}

/* ---------- Imagem que não carregar: mostra fundo verde, sem quebrar o layout ---------- */
$$("img").forEach((img) => {
  const falhou = () => {
    img.style.visibility = "hidden";
    if (img.parentElement.tagName === "FIGURE") img.parentElement.style.background = "#173F35";
  };
  img.addEventListener("error", falhou);
  if (img.complete && img.naturalWidth === 0) falhou();
});

filtrar();
