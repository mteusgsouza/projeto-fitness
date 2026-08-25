'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import Logo from './logo'

/**
 * Registra o service worker e oferece a instalação do app.
 *
 * As duas coisas moram juntas porque uma existe para a outra: o Chrome só
 * dispara `beforeinstallprompt` em página controlada por um SW com fetch
 * handler (ver `public/sw.js`). Sem o registro, este banner nunca apareceria.
 *
 * Nenhum navegador sugere instalar sozinho — o banner automático do Chrome
 * saiu na versão 76. Quem convida é o app, e só depois que o navegador avisa
 * que a instalação é possível.
 *
 * No iOS nada disto roda: o Safari não tem API de instalação, então lá o
 * caminho continua sendo Compartilhar › Adicionar à Tela de Início.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pf-install-dismissed'

function InstallPrompt() {
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null)

  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Falhar aqui só custa o convite de instalação; o app segue igual.
      })
    }
  }, [])

  React.useEffect(() => {
    const onPrompt = (event: Event) => {
      // Sem o preventDefault o Chrome segue com o fluxo dele e o evento não
      // fica guardado para usarmos no clique do botão.
      event.preventDefault()
      if (localStorage.getItem(DISMISSED_KEY) === '1') return
      setDeferred(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setDeferred(null)
      localStorage.removeItem(DISMISSED_KEY)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred) return null

  const instalar = async () => {
    await deferred.prompt()
    await deferred.userChoice
    // O evento só serve uma vez: recusando, o Chrome dispara outro numa
    // visita futura.
    setDeferred(null)
  }

  const dispensar = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDeferred(null)
  }

  return (
    <div
      role='dialog'
      aria-label='Instalar o app'
      className='fixed inset-x-3 bottom-24 z-50 flex items-center gap-3 rounded-xl border border-border bg-popover p-3 shadow-lg md:inset-x-auto md:bottom-6 md:right-6 md:w-80'
    >
      <Logo className='size-8 shrink-0 text-primary' />

      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold leading-tight'>Instalar o Projeto Fitness</p>
        <p className='text-xs text-muted-foreground'>Abre em tela cheia, direto da tela de início.</p>
      </div>

      <Button size='sm' onClick={instalar} className='shrink-0'>
        Instalar
      </Button>

      <Button
        variant='ghost'
        size='icon'
        onClick={dispensar}
        aria-label='Agora não'
        className='size-8 shrink-0 text-muted-foreground'
      >
        <X className='size-4' />
      </Button>
    </div>
  )
}

export default InstallPrompt
