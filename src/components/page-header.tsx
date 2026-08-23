import React from 'react'

/**
 * No mobile o título já aparece no header fixo, então o h1 é escondido para
 * não gastar altura de tela; no desktop ele é o único título da página.
 */
function PageHeader({ title, description, action }: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <div className='hidden md:block min-w-0'>
        <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      {description && (
        <p className='md:hidden text-sm text-muted-foreground min-w-0'>{description}</p>
      )}
      {action && <div className='ml-auto shrink-0'>{action}</div>}
    </div>
  )
}

export default PageHeader
