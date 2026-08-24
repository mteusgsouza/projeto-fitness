"use client"

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Import direto, não `dynamic(..., { ssr: false })`.
 *
 * O next-themes renderiza um <script> que aplica a classe do tema antes da
 * pintura. Com ssr:false o provider só existia no cliente, onde o React não
 * executa script — o anti-FOUC ficava inerte e o console acusava
 * "Encountered a script tag while rendering React component".
 *
 * O <html> já leva suppressHydrationWarning no layout raiz, que é o que
 * torna o import normal seguro aqui.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
