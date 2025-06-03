(function () {
  const dominioOrigem = "pinnacle.com/";
  const destinoBase = "https://pinnacle.bet.br/sportsbook/standard/";
  const linkAtual = window.location.href;

  // Converte apenas se for domínio pinnacle.com
  if (linkAtual.includes(dominioOrigem)) {
    const url = new URL(linkAtual);
    const pathCompleto = url.pathname;

    // Verifica se o primeiro segmento do path parece ser um código de idioma (ex: /en/, /es/)
    const pathParts = pathCompleto.split('/').filter(Boolean); // remove strings vazias
    const possivelIdioma = pathParts[0];

    // Se realmente houver um idioma (como 'en', 'es', etc.), remove para recriar o restante da URL
    if (possivelIdioma && possivelIdioma.length === 2) {
      pathParts.shift(); // remove o idioma da URL
    }

    const novoPath = pathParts.join('/');
    const novoLink = destinoBase + novoPath;

    window.location.href = novoLink;
  }
})();
