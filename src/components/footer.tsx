import React from 'react'
import Link from 'next/link'
import { Github } from 'lucide-react'
import Logo from './logo'

const GITHUB_USER = 'mteusgsouza'
const GITHUB_URL = `https://github.com/${GITHUB_USER}`

/**
 * Rodapé de crédito, só no desktop: no mobile a barra inferior fixa e o botão
 * central ocupam essa faixa, e o rodapé acabava passando por baixo deles.
 */
function Footer() {
  return (
    <footer className='mt-auto hidden border-t border-border bg-card/40 md:block'>
      <div className='container mx-auto flex flex-col items-center gap-3 px-4 py-6 text-sm text-muted-foreground md:h-16 md:flex-row md:justify-between md:gap-0 md:py-0 md:px-6'>
        <Link href='/' className='flex items-center gap-2 font-medium text-foreground transition-opacity hover:opacity-80'>
          <Logo className='size-4 text-primary' />
          Projeto Fitness
        </Link>

        <span>© {new Date().getFullYear()} Mateus Souza</span>

        <a
          href={GITHUB_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1.5 transition-colors hover:text-foreground'
        >
          <Github className='size-4' />
          {GITHUB_USER}
        </a>
      </div>
    </footer>
  )
}

export default Footer
