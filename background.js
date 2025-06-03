chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  const url = changeInfo.url;
  const dominioGringo = "pinnacle.com/en/";
  const dominioBR = "pinnacle.bet.br/sportsbook/standard/";

  if (url.includes(dominioGringo)) {
    // Extrai a parte útil e limpa parâmetros
    let parteUtil = url.split(dominioGringo)[1].split("#")[0].split("?")[0];
    let novaUrl = `https://${dominioBR}${parteUtil}`;

    // Pega o tamanho e posição da aba atual
    chrome.windows.get(tab.windowId, { populate: false }, (win) => {
      chrome.windows.create({
        url: novaUrl,
        width: win.width,
        height: win.height,
        left: win.left,
        top: win.top,
        focused: true,
        type: "normal"
      });

      // Opcional: fecha a aba antiga
      chrome.tabs.remove(tabId);
    });
  }
});
