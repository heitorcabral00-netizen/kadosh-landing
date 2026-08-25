# Site Kadosh

Arquivo único, sem build. Abra `index.html` no navegador ou use a extensão Live Server no VS Code.

## Estrutura
- `index.html` — página completa (HTML + CSS no `<style>`)
- `assets/` — favicon e versões da logo em SVG

## Como editar
- **Cor da marca**: variável `--accent` no `:root` (hoje `#C9A227`). Outras: `--black`, `--ink`, `--line`.
- **Fonte**: Manrope (Google Fonts) + JetBrains Mono nos rótulos pequenos.
- **Contato**: um lugar só — o objeto `KADOSH` no `<script>` no fim do `index.html` (`whatsapp`, `email`, `instagram`). Ele alimenta os botões, o rodapé e o formulário.
- **CNPJ**: no rodapé (ainda placeholder).
- **Cases / clientes**: nomes reais nas seções `#cases` e na faixa "QUEM USA".
- **Imagens**: os blocos hachurados (`.hero-shot`, `.ph`, `.phone`, `.panel`) marcam onde entram as fotos/screenshots. Substitua por `<img src="assets/arquivo.jpg" alt="...">`.

## Captação de leads
O formulário não usa servidor: ele monta a mensagem e abre a conversa no WhatsApp já preenchida
(nome, WhatsApp, segmento, nº de lojas e o pedido do cliente).

Para saber de onde veio o lead, use links com `?origem=`:

    site-kadosh.com/?origem=instagram-bio
    site-kadosh.com/?utm_source=google-ads

A origem entra no fim da mensagem que chega no seu WhatsApp. Sem parâmetro, ele registra o site
que indicou ou "acesso direto".

## Publicar
Sobe direto em Vercel, Netlify, GitHub Pages ou qualquer hospedagem estática — é só enviar a pasta.
