import { cn } from '@/lib/utils'
import { PRODUCT_INITIAL } from '@/lib/brand'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-sm',
        className
      )}
    >
      {PRODUCT_INITIAL}
    </div>
  )
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoMark />
      <span className="font-semibold tracking-tight">{/* name injected by parent */}</span>
    </div>
  )
}
