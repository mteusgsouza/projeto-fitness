'use client'

import * as React from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type PickerOption = {
  value: string
  label: string
  hint?: string
  disabled?: boolean
  disabledReason?: string
}

export type PickerGroup = {
  label?: string
  options: PickerOption[]
}

type PickerProps = {
  groups: PickerGroup[]
  value?: string
  onValueChange: (value: string) => void
  title: string
  description?: string
  placeholder?: string
  searchPlaceholder?: string
  searchable?: boolean
  className?: string
  id?: string
  invalid?: boolean
}

/** Busca tolerante a acento: "triceps" precisa achar "Tríceps". */
function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/**
 * Seletor que abre como bottom sheet no mobile e como modal no desktop.
 * Substitui o <Select> nativo: com dezenas de opções, a lista do Radix vira
 * um scroll apertado e sem busca — ruim justamente onde o app é mais usado.
 */
export function Picker({
  groups,
  value,
  onValueChange,
  title,
  description,
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar...',
  searchable = false,
  className,
  id,
  invalid,
}: PickerProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const selected = React.useMemo(() => {
    for (const group of groups) {
      const found = group.options.find((option) => option.value === value)
      if (found) return found
    }
    return undefined
  }, [groups, value])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return groups
    const term = normalize(query)
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => normalize(option.label).includes(term)),
      }))
      .filter((group) => group.options.length > 0)
  }, [groups, query])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery('')
  }

  function select(option: PickerOption) {
    if (option.disabled) return
    onValueChange(option.value)
    handleOpenChange(false)
  }

  const trigger = (
    <Button
      id={id}
      type='button'
      variant='outline'
      role='combobox'
      aria-expanded={open}
      onClick={() => setOpen(true)}
      className={cn(
        'w-full justify-between h-11 font-normal bg-card',
        !selected && 'text-muted-foreground',
        invalid && 'border-destructive',
        className,
      )}
    >
      <span className='truncate'>{selected?.label ?? placeholder}</span>
      <ChevronDown className='size-4 shrink-0 opacity-50' />
    </Button>
  )

  const list = (
    <div className='flex min-h-0 flex-col'>
      {/* O `relative` precisa envolver so o input: com o padding dentro dele,
          top-1/2 mirava o centro da caixa de 56px e o icone caia 6px abaixo
          do centro do campo. */}
      {searchable && (
        <div className='px-4 pb-3'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className='h-11 pl-9'
              autoFocus={!isMobile}
            />
          </div>
        </div>
      )}

      <div className='max-h-[60vh] overflow-y-auto overscroll-contain px-2 pb-2'>
        {filtered.length === 0 ? (
          <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
            Nenhum resultado para “{query}”
          </p>
        ) : filtered.map((group, index) => (
          <div key={group.label ?? `grupo-${index}`}>
            {group.label && (
              <p className='px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {group.label}
              </p>
            )}
            {group.options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type='button'
                  disabled={option.disabled}
                  onClick={() => select(option)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    isSelected
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'hover:bg-muted active:bg-muted',
                  )}
                >
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate'>{option.label}</span>
                    {(option.hint || option.disabledReason) && (
                      <span className='block truncate text-xs text-muted-foreground'>
                        {option.disabled ? option.disabledReason ?? option.hint : option.hint}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className='size-4 shrink-0 text-primary' />}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={handleOpenChange} repositionInputs={false}>
          <DrawerContent className='max-h-[88vh]'>
            <DrawerHeader className='text-left'>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className={cn(!description && 'sr-only')}>
                {description ?? 'Selecione uma opção'}
              </DrawerDescription>
            </DrawerHeader>
            {list}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='max-w-md gap-0 p-0 pt-4'>
          <DialogHeader className='px-4 pb-3 text-left'>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className={cn(!description && 'sr-only')}>
              {description ?? 'Selecione uma opção'}
            </DialogDescription>
          </DialogHeader>
          {list}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Picker
