/*
  Service worker do app.

  Faz duas coisas:

  1. Guarda a casca — o estático versionado do Next e os ícones — para o app
     abrir sem rede em vez de cair no erro do navegador.
  2. Existe, com fetch handler, que é o que o Chrome exige para disparar o
     `beforeinstallprompt` e permitir que o app ofereça a instalação
     (ver `src/components/install-prompt.tsx`).

  O que ele deliberadamente NÃO faz: cachear HTML de página autenticada. Suas
  fichas e seu histórico são renderizados no servidor a cada visita; guardá-los
  aqui gravaria dados pessoais no aparelho e serviria uma versão velha no
  instante seguinte. Por isso, offline o app abre e mostra a tela de
  `/offline` — não os seus treinos.

  Manutenção: suba a VERSION ao mexer no que é cacheado OU ao mudar a tela de
  `/offline`. O worker só reinstala quando os bytes deste arquivo mudam, então
  sem isso a tela antiga fica guardada. O activate apaga todo cache que não
  seja da versão corrente.
*/

const VERSION = 'v2'
const CACHE_CASCA = `pf-casca-${VERSION}`
const CACHE_PAGINAS = `pf-paginas-${VERSION}`
const URL_OFFLINE = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_PAGINAS)
      // cache: 'reload' evita gravar uma cópia que o próprio HTTP cache já
      // tinha guardado velha.
      .then((cache) => cache.add(new Request(URL_OFFLINE, { cache: 'reload' })))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave.startsWith('pf-') && !chave.endsWith(VERSION))
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  )
})

/** Estático de conteúdo imutável: o Next versiona pelo hash no nome. */
function eImutavel(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Server Actions são POST e não têm o que fazer aqui.
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Imutável: cache primeiro. O nome muda a cada build, então não há
  // versão velha para servir por engano.
  if (eImutavel(url)) {
    event.respondWith(
      caches.match(request).then(
        (guardado) =>
          guardado ||
          fetch(request).then((resposta) => {
            if (resposta.ok) {
              const copia = resposta.clone()
              caches.open(CACHE_CASCA).then((cache) => cache.put(request, copia))
            }
            return resposta
          })
      )
    )
    return
  }

  // Navegação: rede primeiro, sempre — o conteúdo é pessoal e muda. Só quando
  // a rede falha é que entra a tela de offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_PAGINAS)
        const offline = await cache.match(URL_OFFLINE)
        return (
          offline ||
          new Response('Sem conexão.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        )
      })
    )
  }
})
