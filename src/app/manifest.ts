import type { MetadataRoute } from 'next'

/**
 * Manifesto do PWA. Os ícones saem de `public/icons/`, gerados a partir da
 * mesma geometria da marca (`src/components/logo.tsx`).
 *
 * `theme_color` e `background_color` são fixos no escuro de propósito: a
 * splash do app instalado não acompanha o tema do sistema, e este é o mesmo
 * tom do `--background` dark, então a abertura não tem emenda.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Projeto Fitness',
    short_name: 'Fitness',
    description: 'Monte seus treinos, registre cada série e acompanhe sua evolução',
    lang: 'pt-BR',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08120E',
    theme_color: '#08120E',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: 'Treinar agora', short_name: 'Treinar', url: '/history/create' },
      { name: 'Meus treinos', short_name: 'Treinos', url: '/training' },
    ],
  }
}
