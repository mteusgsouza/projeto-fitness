'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { ACCENTS, useAccent, type Accent } from '@/hooks/use-accent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
] as const

/**
 * As amostras precisam mostrar a cor do acento no tema em uso, mas o CSS só
 * troca [data-accent] no <html>. Estas cópias existem só para o seletor —
 * a fonte de verdade continua sendo o globals.css.
 */
const SWATCH: Record<Accent, { light: string; dark: string }> = {
  lima: { light: 'hsl(84 72% 28%)', dark: 'hsl(82 100% 62%)' },
  ciano: { light: 'hsl(195 92% 30%)', dark: 'hsl(190 95% 58%)' },
  ambar: { light: 'hsl(30 90% 36%)', dark: 'hsl(38 96% 60%)' },
  magenta: { light: 'hsl(330 74% 38%)', dark: 'hsl(330 90% 66%)' },
}

function Appearance() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { accent, setAccent } = useAccent()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='label-tec text-muted-foreground'>Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-2'>
            {THEMES.map((option) => {
              const selected = theme === option.value
              return (
                <button key={option.value} type='button'
                  onClick={() => setTheme(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-colors',
                    selected
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border hover:bg-muted'
                  )}>
                  <option.Icon className='size-5' />
                  <span className='text-sm font-medium'>{option.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='label-tec text-muted-foreground'>Cor de destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-4 gap-2'>
            {ACCENTS.map((option) => {
              const selected = accent === option.value
              const color = isDark ? SWATCH[option.value].dark : SWATCH[option.value].light
              return (
                <button key={option.value} type='button'
                  onClick={() => setAccent(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-20 flex-col items-center justify-center gap-2 rounded-xl border transition-colors',
                    selected ? 'border-primary bg-accent' : 'border-border hover:bg-muted'
                  )}>
                  <span className='flex size-8 items-center justify-center rounded-full'
                    style={{ backgroundColor: color }}>
                    {selected && (
                      <Check className='size-4' style={{ color: isDark ? '#07100D' : '#FFFFFF' }} />
                    )}
                  </span>
                  <span className='text-xs font-medium'>{option.label}</span>
                </button>
              )
            })}
          </div>
          <p className='mt-3 text-sm text-muted-foreground'>
            A cor vale neste aparelho. Cada tema usa uma luminosidade própria do
            mesmo matiz, para manter o contraste do texto.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Appearance
