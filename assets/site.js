/* =====================================================================
   CONFIGURAÇÃO — troque os 3 valores abaixo e o site inteiro
   (botões, rodapé e formulário) passa a apontar para o lugar certo.
   ===================================================================== */
const KADOSH = {
  whatsapp : "5564993404936",               // DDI 55 + DDD 64 + número
  formKey  : ""                             // chave do Web3Forms (web3forms.com). Vazio = cai no WhatsApp
};
/* ===================================================================== */


/* =====================================================================
   CASES — para colocar um cliente novo na vitrine, acrescente um bloco
   aqui embaixo. Não precisa mexer em mais nada: a seção "Cases" se monta
   sozinha e a última fileira, se ficar incompleta, já sai centralizada.

     nome  : como aparece no título do card
     foto  : arquivo dentro de assets/ (larga, uns 800x500 — o card corta
             em 200px de altura, então o assunto precisa estar no meio)
     alt   : descrição da foto, para leitor de tela e para o Google
     foco  : opcional. Só use se a foto cortar no lugar errado —
             "center 22%" puxa o corte para cima, "center 70%" para baixo
     texto : o que foi feito para esse cliente, 1 ou 2 frases
   ===================================================================== */
const CASES = [
  {
    nome : "Vento Aragano",
    foto : "assets/case-vento-aragano.jpg",
    alt  : "Equipe do Vento Aragano no estande da Rota Gastronômica em Rio Verde",
    foco : "center 22%",
    texto: "Cardápio próprio, PDV de balcão e impressão automática na cozinha. Programa de fidelidade por pontos e taxa de entrega calculada por região no mapa."
  },
  {
    nome : "Trilhas da Amazônia",
    foto : "assets/case-trilhas.jpg",
    alt  : "Loja da Trilhas da Amazônia em Rio Verde, com o fusca da marca em frente",
    texto: "Açaiteria em Rio Verde. Canal de venda direto com pedido caindo impresso na cozinha e campanhas promocionais no WhatsApp."
  },
  {
    nome : "Pizza's Imperial",
    foto : "assets/case-pizzas-imperial.jpg",
    alt  : "Fachada da Pizza's Imperial em Rio Verde",
    texto: "Pizzaria e hamburgueria em Rio Verde. Cardápio próprio com pizza meio a meio, em que o preço sai pela média dos sabores escolhidos."
  }
];
/* ===================================================================== */

/* Endereço do painel (kadosh-sites). É de lá que vêm os cases cadastrados.
   Deixe vazio para o site usar só a lista de cima e não chamar ninguém. */
const PAINEL = "https://kadosh-sites.onrender.com";

/**
 * Faz um bloco recém-inserido aparecer.
 *
 * Bloco que chega depois do carregamento — vindo do painel — não pode depender
 * do observador da animação disparar de novo: se ele já está à vista, aparece
 * agora; se ainda vai ser alcançado ao rolar, entra na fila do observador e
 * ganha a mesma animação dos vizinhos.
 */
function revelarBloco(el){
  const r = el.getBoundingClientRect();
  const jaAVista = r.top < (window.innerHeight || 0) && r.bottom > 0;
  if (jaAVista || !window.revelar) el.classList.add('vis');
  else window.revelar(el);
}

/* monta os cards de case. Roda antes da animação de entrada mais abaixo,
   senão os cards nasceriam invisíveis. */
function montarCases(lista){
  const alvo = document.getElementById('lista-cases');
  if (!alvo) return;
  alvo.innerHTML = '';

  lista.forEach(c => {
    const card = document.createElement('div');
    card.className = 'case reveal';

    const shot = document.createElement('div');
    shot.className = 'shot';
    const foto = document.createElement('img');
    foto.src = c.foto;
    foto.alt = c.alt || c.nome;
    if (c.foco) foto.style.objectPosition = c.foco;
    shot.appendChild(foto);

    const corpo = document.createElement('div');
    corpo.className = 'case-body';
    const titulo = document.createElement('h3');
    titulo.textContent = c.nome;
    const texto = document.createElement('p');
    texto.textContent = c.texto;
    corpo.append(titulo, texto);

    card.append(shot, corpo);
    alvo.appendChild(card);
  });
}

/* A lista escrita aqui no arquivo aparece na hora, sem esperar ninguém.
   Em seguida, se o painel responder, ela é trocada pelo que estiver
   cadastrado lá. É por isso que a vitrine nunca fica vazia: painel fora do
   ar, internet ruim ou domínio trocado só significam "fica a lista de cima". */
montarCases(CASES);

(function(){
  if (!PAINEL) return;

  // AbortSignal.timeout não existe em navegador antigo — sem ele, sem limite
  const limite = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
    ? { signal: AbortSignal.timeout(8000) } : {};

  fetch(PAINEL + '/api/landing/cases', limite)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('painel respondeu ' + r.status)))
    .then(doPainel => {
      if (!Array.isArray(doPainel) || doPainel.length === 0) return;
      montarCases(doPainel);
      // estes cards nascem depois que a animação de entrada já passou por aqui:
      // sem isto, ficariam presos no opacity 0
      document.querySelectorAll('#lista-cases .reveal').forEach(revelarBloco);
    })
    .catch(() => {});
})();


/* =====================================================================
   CONTEÚDO VINDO DO PAINEL

   Os textos abaixo continuam escritos no HTML acima — eles são o que o
   visitante vê enquanto o painel não responde, e o que ele vê para sempre
   se o painel estiver fora do ar. Quando o painel responde, este trecho
   substitui o texto dos elementos que já existem.

   De propósito, nada aqui cria ou remove estilo: procura o elemento pelo
   seletor, troca o conteúdo e pronto. Nenhuma classe, nenhuma marcação e
   nenhuma regra de CSS foram alteradas para isto funcionar — é o que
   garante que o site não muda de aparência ao ligar o CMS.

   `?previa=<token>` mostra o rascunho em vez do publicado.
   ===================================================================== */
(function(){
  if (!PAINEL) return;

  const q  = (s, raiz) => (raiz || document).querySelector(s);
  const qa = (s, raiz) => [...(raiz || document).querySelectorAll(s)];

  /* {preco} vem da configuração; **isto** vira negrito. Montado com nós de
     texto em vez de innerHTML: conteúdo de campo nunca vira marcação. */
  function escrever(el, texto, cfg, estiloNegrito){
    if (!el || texto == null) return;
    const pronto = String(texto).replace(/\{preco\}/g, cfg.precoMensal || '');
    el.textContent = '';
    pronto.split('**').forEach((parte, i) => {
      if (!parte) return;
      if (i % 2 === 1) {
        const b = document.createElement('b');
        b.textContent = parte;
        if (estiloNegrito) b.setAttribute('style', estiloNegrito);
        el.appendChild(b);
      } else {
        el.appendChild(document.createTextNode(parte));
      }
    });
  }

  const escreverEm = (sel, texto, cfg, estilo) => escrever(q(sel), texto, cfg, estilo);

  /* Fora da home, uma âncora como #contato não existe na página: ela precisa
     virar index.html#contato, senão o menu vindo do painel não leva a lugar
     nenhum na página de cases. */
  const NA_HOME = /(\/|\/index\.html)$/.test(location.pathname);

  /* "wa" abre o WhatsApp; o resto vai como está (âncora ou endereço). */
  function destino(d, cfg){
    if (d === 'wa') return 'https://wa.me/' + (cfg.whatsapp || KADOSH.whatsapp);
    if (d && d.charAt(0) === '#' && !NA_HOME) return 'index.html' + d;
    return d || '#';
  }

  function aplicarLink(el, link, cfg){
    if (!el || !link) return;
    escrever(el, link.texto, cfg);
    el.setAttribute('href', destino(link.destino, cfg));
    if (link.novaAba) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    else { el.removeAttribute('target'); el.removeAttribute('rel'); }
  }

  /* Refaz uma lista clonando um item que já está na página: o clone traz as
     classes e a estrutura originais, então o visual é o mesmo.

     `seletorItem` existe porque nem todo container tem só itens dentro — o
     das dúvidas começa com o <h2> da seção. Sem apontar qual é o item, o
     molde vira o título e a lista inteira sai errada. */
  function listar(container, itens, montar, seletorItem){
    if (!container) return;
    const antigos = qa(':scope > ' + seletorItem, container);
    const molde = antigos[0];
    if (!molde) return;
    const ativos = (itens || []).filter(i => i && i.ativo !== false);
    if (ativos.length === 0) return;

    const novos = ativos.map(item => {
      const el = molde.cloneNode(true);
      montar(el, item);
      return el;
    });
    molde.before(...novos);            // entram no lugar dos antigos
    antigos.forEach(el => el.remove()); // e só então os antigos saem

    /* entram na mesma animação de entrada dos blocos originais, com o mesmo
       escalonamento — o clone herda o atraso do molde, que é sempre o do
       primeiro item, então o atraso é recalculado aqui. */
    novos.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
      if (el.classList.contains('reveal')) revelarBloco(el);
      qa('.reveal', el).forEach(revelarBloco);
    });
  }

  function aplicar(c){
    const cfg = c.config || {};

    /* topo */
    listar(q('header nav'), c.header && c.header.menu, (el, item) => aplicarLink(el, item, cfg), 'a');
    aplicarLink(q('header .head-cta .btn'), c.header && c.header.botao, cfg);

    /* abertura */
    if (c.hero) {
      escreverEm('#top .eyebrow', c.hero.eyebrow, cfg);
      escreverEm('#top h1', c.hero.titulo, cfg);
      escreverEm('#top > p', c.hero.texto, cfg);
      const botoes = qa('#top .actions .btn');
      aplicarLink(botoes[0], c.hero.botaoPrimario, cfg);
      aplicarLink(botoes[1], c.hero.botaoSecundario, cfg);

      /* Os selos têm posição própria no CSS (b-taxa / b-saldo), então aqui
         só o texto muda: um selo a mais não teria onde se posicionar. */
      const selos = qa('#top .badge-float');
      (c.hero.selos || []).forEach((selo, i) => {
        const alvo = selos[i];
        if (!alvo) return;
        if (selo.ativo === false) { alvo.style.display = 'none'; return; }
        escrever(q('.rot', alvo), selo.rotulo, cfg);
        escrever(q('.num', alvo), selo.numero, cfg);
        escrever(q('.sub', alvo), selo.sub, cfg);
      });
      selos.slice((c.hero.selos || []).length).forEach(el => { el.style.display = 'none'; });
    }

    /* quatro frentes */
    if (c.solucoes) {
      escreverEm('#solucoes .eyebrow', c.solucoes.eyebrow, cfg);
      escreverEm('#solucoes h2', c.solucoes.titulo, cfg);

      // guarda os ícones desenhados no HTML antes de refazer os cards
      const nomes = ['sacola', 'janela', 'camadas', 'escudo'];
      const icones = {};
      qa('#solucoes .card .ico').forEach((ico, i) => {
        const copia = ico.cloneNode(true);
        copia.removeAttribute('style');       // o dourado é do card em destaque
        icones[nomes[i]] = copia;
      });
      const DOURADO = 'background:var(--accent);border-color:var(--accent);color:#0B0B0C';

      listar(q('#solucoes .grid-4'), c.solucoes.cards, (el, card) => {
        const antigo = q('.ico', el);
        const novo = (icones[card.icone] || icones.escudo || antigo).cloneNode(true);
        if (card.destaque) novo.setAttribute('style', DOURADO);
        if (antigo) antigo.replaceWith(novo);
        escrever(q('h3', el), card.titulo, cfg);
        escrever(q('p', el), card.texto, cfg);
      }, '.card');
    }

    /* carro-chefe */
    if (c.delivery) {
      escreverEm('#delivery .eyebrow', c.delivery.eyebrow, cfg);
      escreverEm('#delivery h2', c.delivery.titulo, cfg);
      escreverEm('#delivery p', c.delivery.texto, cfg);
      listar(q('#delivery .feats'), c.delivery.features, (el, f) => {
        const traco = q('i', el);            // o traço dourado é um <i> vazio
        el.textContent = '';
        if (traco) el.appendChild(traco);
        el.appendChild(document.createTextNode(String(f.texto || '')));
      }, '.feat');
      aplicarLink(q('#delivery .btn-dark'), c.delivery.botao, cfg);
      // o negrito do preço é mais escuro que o resto da frase, como no original
      escreverEm('#delivery .btn-dark + span', c.delivery.notaPreco, cfg, 'color:var(--ink)');
    }

    /* como funciona */
    if (c.como) {
      escreverEm('#como .eyebrow', c.como.eyebrow, cfg);
      escreverEm('#como h2', c.como.titulo, cfg);
      listar(q('#como .steps'), c.como.passos, (el, p) => {
        escrever(q('b', el), p.numero, cfg);
        escrever(q('h3', el), p.titulo, cfg);
        escrever(q('p', el), p.texto, cfg);
      }, '.step');
    }

    /* cases (os cards em si vêm da outra tela do painel) */
    if (c.cases) {
      escreverEm('#cases h2', c.cases.titulo, cfg);
      const verTodos = q('#cases h2 + a');
      if (verTodos) {
        if (c.cases.verTodos && c.cases.verTodos.ativo === false) verTodos.style.display = 'none';
        else aplicarLink(verTodos, c.cases.verTodos, cfg);
      }
    }

    /* dúvidas */
    if (c.faq) {
      escreverEm('#faq h2', c.faq.titulo, cfg);
      listar(q('#faq .faq'), c.faq.perguntas, (el, item) => {
        escrever(q('h3', el), item.pergunta, cfg);
        escrever(q('p', el), item.resposta, cfg);
      }, '.qa');
    }

    /* contato */
    if (c.contato) {
      escreverEm('#contato h2', c.contato.titulo, cfg);
      const textos = qa('#contato .cta-copy p');
      escrever(textos[0], c.contato.texto, cfg);
      if (textos[1]) {
        // este parágrafo tem o link do WhatsApp dentro: troca só a primeira linha
        const primeiro = textos[1].firstChild;
        if (primeiro && primeiro.nodeType === 3) primeiro.textContent = c.contato.textoAlternativo;
      }
      escrever(q('#contato [data-link="wa"]'), c.contato.linkWhatsapp, cfg);
      escrever(q('#contato form h3'), c.contato.formTitulo, cfg);
      escrever(q('#contato form button'), c.contato.formBotao, cfg);
      escrever(q('#contato .legal'), c.contato.formLegal, cfg);
    }

    /* rodapé */
    if (c.rodape) {
      const cnpj = q('footer .logo + div');
      escrever(cnpj, c.rodape.cnpj, cfg);
      listar(q('footer .fcols'), c.rodape.colunas, (el, col) => {
        const titulo = q('b', el);
        qa('a', el).forEach(a => a.remove());
        escrever(titulo, col.titulo, cfg);
        (col.links || []).forEach(link => {
          const a = document.createElement('a');
          aplicarLink(a, link, cfg);
          el.appendChild(a);
        });
      }, '.fcol');
    }

    /* o número do WhatsApp também vale para os botões montados no início */
    if (cfg.whatsapp) {
      qa('[data-link="wa"]').forEach(a => { a.href = 'https://wa.me/' + cfg.whatsapp; });
    }
  }

  /* ===================================================================
     MODO EDITOR

     Quando o site é aberto dentro do painel (?editor=1, num iframe), ele
     para de buscar conteúdo e passa a receber o rascunho por mensagem, a
     cada tecla digitada — é a prévia ao vivo. Também devolve ao painel a
     seção em que se clicou, para abrir a edição dela.

     Nada disso liga fora do iframe: o visitante do site nunca entra aqui.
     =================================================================== */
  const SECOES_DOM = [
    ['header',   'header'],
    ['hero',     '#top'],
    ['solucoes', '#solucoes'],
    ['delivery', '#delivery'],
    ['como',     '#como'],
    ['cases',    '#cases'],
    ['faq',      '#faq'],
    ['contato',  '#contato'],
    ['rodape',   'footer'],
  ];

  const ORIGENS_CONFIAVEIS = [
    'https://kadosh-sites.onrender.com',
    'http://localhost:3000',
  ];

  function ligarModoEditor(){
    document.documentElement.classList.add('modo-editor');

    const estilo = document.createElement('style');
    estilo.textContent =
      '.modo-editor [data-secao]{outline:2px solid transparent;outline-offset:-2px;' +
      'transition:outline-color .15s,background-color .15s;cursor:pointer}' +
      '.modo-editor [data-secao]:hover{outline-color:#C9A227}' +
      '.modo-editor [data-secao].secao-ativa{outline-color:#C9A227;outline-width:3px}' +
      '.modo-editor .marca-secao{position:fixed;z-index:99999;background:#0B0B0C;color:#fff;' +
      'font:600 11px/1 Manrope,sans-serif;letter-spacing:.04em;padding:6px 10px;border-radius:6px;' +
      'pointer-events:none;opacity:0;transition:opacity .15s;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
      '.modo-editor .marca-secao.vis{opacity:1}';
    document.head.appendChild(estilo);

    const marca = document.createElement('div');
    marca.className = 'marca-secao';
    document.body.appendChild(marca);

    const nomes = {
      header: 'Topo', hero: 'Abertura', solucoes: 'Quatro frentes', delivery: 'Carro-chefe',
      como: 'Como funciona', cases: 'Cases', faq: 'Dúvidas', contato: 'Contato', rodape: 'Rodapé',
    };

    SECOES_DOM.forEach(([chave, sel]) => {
      const el = q(sel);
      if (!el) return;
      el.setAttribute('data-secao', chave);

      el.addEventListener('mouseenter', () => {
        const r = el.getBoundingClientRect();
        marca.textContent = 'Editar ' + (nomes[chave] || chave);
        marca.style.left = Math.max(8, r.left + 12) + 'px';
        marca.style.top = Math.max(8, r.top + 12) + 'px';
        marca.classList.add('vis');
      });
      el.addEventListener('mouseleave', () => marca.classList.remove('vis'));

      el.addEventListener('click', (e) => {
        e.preventDefault();     // no editor, clicar não navega
        e.stopPropagation();
        qa('[data-secao]').forEach(s => s.classList.remove('secao-ativa'));
        el.classList.add('secao-ativa');
        parent.postMessage({ tipo: 'kadosh-secao', secao: chave }, '*');
      });
    });

    // links e formulário não funcionam dentro do editor
    document.addEventListener('submit', e => e.preventDefault(), true);

    window.addEventListener('message', (ev) => {
      if (ORIGENS_CONFIAVEIS.indexOf(ev.origin) === -1) return;
      const msg = ev.data || {};
      if (msg.tipo === 'kadosh-conteudo') {
        if (msg.conteudo) aplicar(msg.conteudo);
        if (Array.isArray(msg.cases) && msg.cases.length) montarCases(msg.cases);
      }
      if (msg.tipo === 'kadosh-focar') {
        const alvo = q('[data-secao="' + msg.secao + '"]');
        if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    parent.postMessage({ tipo: 'kadosh-pronto' }, '*');
  }

  const params = new URLSearchParams(location.search);
  if (params.get('editor') === '1' && window.parent !== window) {
    ligarModoEditor();
    return;                    // no editor o conteúdo vem por mensagem
  }

  const previa = params.get('previa');
  const endereco = PAINEL + '/api/landing/conteudo' + (previa ? '?previa=' + encodeURIComponent(previa) : '');
  const limite = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout)
    ? { signal: AbortSignal.timeout(8000) } : {};

  fetch(endereco, limite)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('painel respondeu ' + r.status)))
    .then(aplicar)
    .catch(() => {});   // sem painel, fica o que está escrito no HTML
})();


const waLink = t => "https://wa.me/" + KADOSH.whatsapp + (t ? "?text=" + encodeURIComponent(t) : "");

document.querySelectorAll('[data-link="wa"]').forEach(a => a.href = waLink());
document.querySelectorAll('[data-mail-text]').forEach(a => a.textContent = KADOSH.email);


/* clicar num print do sistema abre ele inteiro (o do site fica pequeno demais
   para ler). Fecha clicando fora, no botão, ou com Esc. */
(function(){
  const prints = document.querySelectorAll('.mock-phone img, .device img, .mb-body img');
  if (!prints.length) return;

  const caixa = document.createElement('div');
  caixa.className = 'lightbox';
  caixa.setAttribute('role', 'dialog');
  caixa.setAttribute('aria-modal', 'true');
  caixa.innerHTML = '<button class="fechar" type="button" aria-label="Fechar">Fechar ✕</button><img alt="">';
  document.body.appendChild(caixa);

  const grande = caixa.querySelector('img');
  const botao = caixa.querySelector('.fechar');
  let ultimo = null;

  const abrir = (img) => {
    grande.src = img.currentSrc || img.src;
    grande.alt = img.alt || '';
    caixa.classList.add('aberto');
    document.body.style.overflow = 'hidden';
    ultimo = img;
    botao.focus();
  };
  const fechar = () => {
    caixa.classList.remove('aberto');
    document.body.style.overflow = '';
    if (ultimo) { ultimo.focus?.(); ultimo = null; }
  };

  prints.forEach((img) => {
    img.classList.add('zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => abrir(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(img); }
    });
  });

  caixa.addEventListener('click', fechar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caixa.classList.contains('aberto')) fechar();
  });
})();

/* revela os blocos conforme a página rola, em cascata.
   Quem pediu menos movimento no sistema vê tudo direto, sem animação. */
(function(){
  const alvos = [...document.querySelectorAll('.reveal')];
  const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!suave || !('IntersectionObserver' in window)) {
    alvos.forEach(el => el.classList.add('vis'));
    // conteúdo que chega depois, do painel, também precisa aparecer
    window.revelar = el => el.classList.add('vis');
    return;
  }

  // itens irmãos entram escalonados, para não aparecerem todos de uma vez
  const contagem = new Map();
  alvos.forEach(el => {
    const pai = el.parentElement;
    const i = contagem.get(pai) || 0;
    el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
    contagem.set(pai, i + 1);
  });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      observador.unobserve(e.target);   // revela uma vez só
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  alvos.forEach(el => observador.observe(el));

  /* Blocos montados depois — os cases e o conteúdo que vem do painel —
     entram na mesma fila. Sem isto eles ou apareceriam de estalo, sem a
     animação dos vizinhos, ou ficariam presos invisíveis. */
  window.revelar = el => observador.observe(el);
})();

/* parallax: cada camada do mockup segue o mouse numa velocidade,
   pelo data-depth. Só liga em tela com mouse e se o usuário não
   tiver pedido menos animação no sistema. */
const palco = document.getElementById('stage');
const podeAnimar = matchMedia('(hover:hover)').matches
                && !matchMedia('(prefers-reduced-motion:reduce)').matches;

if (palco && podeAnimar) {
  const camadas = [...palco.querySelectorAll('.layer')];
  const area = palco.closest('.hero');
  let parado = true;

  area.addEventListener('mousemove', e => {
    const r = area.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    if (parado) { camadas.forEach(el => el.style.transition = 'transform .18s ease-out'); parado = false; }
    camadas.forEach(el => {
      const d = +el.dataset.depth;
      el.style.transform = `translate3d(${(-x*d).toFixed(1)}px, ${(-y*d*.6).toFixed(1)}px, 0)`;
    });
  });

  area.addEventListener('mouseleave', () => {
    parado = true;
    camadas.forEach(el => { el.style.transition = ''; el.style.transform = 'translate3d(0,0,0)'; });
  });
}

/* máscara leve do telefone */
const zap = document.getElementById('f-zap');
zap.addEventListener('input', () => {
  const d = zap.value.replace(/\D/g, '').slice(0, 11);
  zap.value = d.length > 6 ? `(${d.slice(0,2)}) ${d.slice(2, d.length-4)}-${d.slice(-4)}`
            : d.length > 2 ? `(${d.slice(0,2)}) ${d.slice(2)}`
            : d;
});

/* de onde veio o lead: ?utm_source= , ?origem= ou o site que indicou */
const p = new URLSearchParams(location.search);
const origem = p.get('utm_source') || p.get('origem') || document.referrer || 'acesso direto';

document.getElementById('form-lead').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const val = n => f.elements[n].value.trim();

  let ok = true;
  ['nome', 'zap', 'segmento'].forEach(n => {
    const el = f.elements[n], vazio = !el.value.trim();
    el.classList.toggle('err', vazio);
    if (vazio) ok = false;
  });
  if (!ok) { f.querySelector('.err').focus(); return; }

  const resumo = `Nome: ${val('nome')}\n`
    + `WhatsApp: ${val('zap')}\n`
    + `Segmento: ${val('segmento')}\n`
    + `Lojas: ${val('lojas')}\n`
    + (val('mensagem') ? `Preciso de: ${val('mensagem')}\n` : '')
    + `\n(origem: ${origem})`;

  /* sem chave configurada, mantem o caminho antigo: o cliente chama no WhatsApp */
  const paraWhats = () => {
    const url = waLink('Olá, Kadosh! Vim pelo site.\n\n' + resumo);
    if (!window.open(url, '_blank', 'noopener')) location.href = url;
  };
  if (!KADOSH.formKey) return paraWhats();

  const btn = f.querySelector('button[type=submit]');
  const rotulo = btn.textContent;
  btn.disabled = true; btn.textContent = 'Enviando…';

  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body   : JSON.stringify({
        access_key : KADOSH.formKey,
        subject    : `Novo contato pelo site — ${val('nome')} (${val('segmento')})`,
        from_name  : 'Site Kadosh',
        nome       : val('nome'),
        whatsapp   : val('zap'),
        segmento   : val('segmento'),
        lojas      : val('lojas'),
        mensagem   : val('mensagem') || '—',
        origem     : origem
      })
    });
    if (!(await r.json()).success) throw new Error('recusado');

    const primeiro = val('nome').split(' ')[0].replace(/[<>&]/g, '');
    f.innerHTML = '<h3>Recebemos o seu contato</h3>'
      + '<p class="ok-msg">Obrigado, ' + primeiro + '. A gente chama você no WhatsApp em até um dia útil.</p>'
      + '<p class="ok-msg">Se preferir adiantar, <a href="' + waLink('Olá, Kadosh! Acabei de preencher o formulário no site.') + '" target="_blank" rel="noopener">fale com a gente agora</a>.</p>';
  } catch (err) {
    btn.disabled = false; btn.textContent = rotulo;
    paraWhats();
  }
});
