'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { groupByMuscle, levelLabel, type ExerciseOption } from '@/lib/exercise'

/** Busca tolerante a acento: "triceps" precisa achar "Tríceps". */
function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

const LEVEL_TONE: Record<string, string> = {
  iniciante: 'bg-primary/15 text-primary border-primary/25',
  intermediario: 'bg-chart-3/15 text-chart-3 border-chart-3/25',
  avancado: 'bg-destructive/15 text-destructive border-destructive/25',
}

function Catalog({ exercises }: { exercises: ExerciseOption[] }) {
  const [query, setQuery] = React.useState('')

  const groups = React.useMemo(() => {
    const term = normalize(query.trim())
    const filtered = term
      ? exercises.filter((exercise) =>
        normalize(exercise.name).includes(term)
        || normalize(exercise.muscleGroup).includes(term)
        || normalize(exercise.equipment ?? '').includes(term))
      : exercises
    return groupByMuscle(filtered)
  }, [exercises, query])

  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder='Buscar por nome, grupo ou equipamento...'
          className='h-11 pl-9' />
      </div>

      <p className='label-tec text-muted-foreground'>
        {total} {total === 1 ? 'exercício' : 'exercícios'}
      </p>

      {total === 0 ? (
        <p className='py-10 text-center text-sm text-muted-foreground'>
          Nenhum resultado para “{query}”
        </p>
      ) : (
        <div className='space-y-5'>
          {groups.map((group) => (
            <section key={group.value} className='space-y-2'>
              <div className='flex items-baseline gap-2'>
                <h2 className='label-tec text-muted-foreground'>{group.label}</h2>
                <span className='tabular text-xs text-muted-foreground'>{group.items.length}</span>
              </div>
              <div className='grid gap-2 md:grid-cols-2'>
                {group.items.map((exercise) => (
                  <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                    <Card className='h-full transition-colors hover:bg-muted active:bg-muted'>
                      <CardContent className='flex items-center gap-3 p-3'>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>{exercise.name}</p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {[exercise.equipment, exercise.usesLoad ? null : 'sem carga']
                              .filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <Badge variant='outline'
                          className={`shrink-0 text-[0.625rem] ${LEVEL_TONE[exercise.level] ?? ''}`}>
                          {levelLabel(exercise.level)}
                        </Badge>
                        <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalog
