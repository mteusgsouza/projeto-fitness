import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Marca do app: a prancheta da ficha com o halter dentro.
 *
 * Segue a métrica do lucide-react (grade 24, traço 2, ponta redonda) para
 * sentar ao lado dos ícones da UI sem destoar de peso, e pinta em
 * currentColor — é o que faz ela acompanhar tema e acento trocável
 * (`text-primary`) sem precisar de variante por tema.
 *
 * O halter fica na diagonal e usa discos maciços contra barra em traço: com
 * tudo no mesmo peso e na horizontal, o conjunto lia como um "H".
 *
 * O ícone instalado do PWA é esta mesma geometria, só escalada sobre o
 * azulejo escuro — ver `src/app/icon.svg` e `public/icons/`.
 */
function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className={cn('size-6 shrink-0', className)}
      {...props}
    >
      <rect x='8' y='2' width='8' height='4' rx='1' />
      <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
      <g transform='rotate(-45 12 14.2)'>
        <path d='M10.2 14.2h3.6' />
        <g fill='currentColor' stroke='none'>
          <rect x='8.8' y='11' width='2' height='6.4' rx='1' />
          <rect x='13.2' y='11' width='2' height='6.4' rx='1' />
          <rect x='6.6' y='12.1' width='1.6' height='4.2' rx='0.8' />
          <rect x='15.8' y='12.1' width='1.6' height='4.2' rx='0.8' />
        </g>
      </g>
    </svg>
  )
}

export default Logo
