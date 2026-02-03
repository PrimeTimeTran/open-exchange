import { SpotlightCard } from '@/components/ui'

export function ColorCard({
  bg,
  name,
  text,
  border,
}: {
  bg: string
  name: string
  text: string
  border?: string
}) {
  return (
    <SpotlightCard
      className={`rounded-lg overflow-hidden border ${
        border ? `border-outline-variant` : 'border-transparent'
      } bg-background`}
      spotlightColor='rgba(255, 255, 255, 0.3)'
    >
      <div
        className={`h-24 ${bg} flex items-center justify-center relative z-0`}
      >
        <span className={`${text} text-xs font-medium`}>{bg}</span>
      </div>
      <div className='p-3 bg-surface relative z-0'>
        <p className='text-sm font-medium'>{name}</p>
      </div>
    </SpotlightCard>
  )
}
