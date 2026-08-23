'use client'

import * as React from 'react'

export const ACCENTS = [
  { value: 'lima', label: 'Lima' },
  { value: 'ciano', label: 'Ciano' },
  { value: 'ambar', label: 'Âmbar' },
  { value: 'magenta', label: 'Magenta' },
] as const

export type Accent = (typeof ACCENTS)[number]['value']

export const ACCENT_STORAGE_KEY = 'pf-accent'
export const DEFAULT_ACCENT: Accent = 'lima'

/**
 * Script injetado no <head> antes da pintura: aplica o acento salvo sem
 * piscar o padrão. Mesmo princípio do next-themes para o tema.
 */
export const ACCENT_INIT_SCRIPT =
  `try{var a=localStorage.getItem('${ACCENT_STORAGE_KEY}');` +
  `if(a)document.documentElement.setAttribute('data-accent',a)}catch(e){}`

let listeners: (() => void)[] = []

function subscribe(onChange: () => void) {
  listeners.push(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners = listeners.filter((listener) => listener !== onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getSnapshot(): Accent {
  return (document.documentElement.getAttribute('data-accent') as Accent) || DEFAULT_ACCENT
}

function getServerSnapshot(): Accent {
  return DEFAULT_ACCENT
}

/**
 * O atributo data-accent no <html> É o estado — não há cópia em React.
 * useSyncExternalStore lê dele direto, o que evita setState dentro de efeito
 * (regra que o Next 16 passou a aplicar) e mantém tudo em sincronia.
 */
export function useAccent() {
  const accent = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setAccent = React.useCallback((next: Accent) => {
    document.documentElement.setAttribute('data-accent', next)
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, next)
    } catch {
      // modo privado / storage bloqueado: o acento vale só nesta sessão
    }
    listeners.forEach((listener) => listener())
  }, [])

  return { accent, setAccent }
}
