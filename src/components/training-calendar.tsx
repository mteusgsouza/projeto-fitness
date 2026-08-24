'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTrainingCalendar, type TrainingCalendar } from '@/actions/stats/_actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

function TrainingCalendarCard({ initial }: { initial: TrainingCalendar }) {
  const [calendar, setCalendar] = React.useState(initial)
  const [isPending, startTransition] = React.useTransition()

  function move(delta: number) {
    startTransition(async () => {
      const next = await getTrainingCalendar(calendar.offset + delta)
      if (next) setCalendar(next)
    })
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <CardTitle className='label-tec text-muted-foreground'>Calendário</CardTitle>
            {/* first-letter em vez de capitalize: o capitalize do CSS
                maiuscula cada palavra e virava "Agosto De 2026" */}
            <p className='text-lg font-semibold leading-tight first-letter:uppercase'>
              {calendar.monthLabel}
            </p>
            <p className='text-sm text-muted-foreground tabular'>
              {calendar.total} {calendar.total === 1 ? 'treino' : 'treinos'} no mês
            </p>
          </div>
          <div className='flex shrink-0 gap-1'>
            <Button variant='ghost' size='icon' className='size-9'
              aria-label='Mês anterior' disabled={isPending}
              onClick={() => move(-1)}>
              <ChevronLeft className='size-4' />
            </Button>
            <Button variant='ghost' size='icon' className='size-9'
              aria-label='Próximo mês' disabled={isPending || calendar.offset >= 0}
              onClick={() => move(1)}>
              <ChevronRight className='size-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pb-4'>
        <div className='grid grid-cols-7 gap-1'
          style={{ opacity: isPending ? 0.55 : 1, transition: 'opacity 150ms' }}>
          {WEEKDAYS.map((day, index) => (
            <div key={index}
              className='pb-1 text-center text-[0.625rem] font-semibold uppercase text-muted-foreground'>
              {day}
            </div>
          ))}

          {calendar.days.map((day) => {
            const treinou = day.sessions > 0
            return (
              <div key={day.date}
                title={day.labels.join(' · ') || undefined}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm tabular',
                  !day.inMonth && 'opacity-30',
                  treinou
                    ? 'bg-primary/15 font-semibold text-primary'
                    : 'text-muted-foreground',
                  day.isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-card',
                )}>
                <span>{day.dayOfMonth}</span>
                {/* Um ponto por sessão: dois treinos no mesmo dia aparecem */}
                <span className='flex h-1 items-center gap-0.5'>
                  {Array.from({ length: Math.min(day.sessions, 3) }, (_, index) => (
                    <span key={index} className='size-1 rounded-full bg-primary' />
                  ))}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default TrainingCalendarCard
