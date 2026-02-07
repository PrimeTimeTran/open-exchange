import { ColorCard } from './color-card'
import { AnimatedGradientSection } from '@/components/ui'

export function ColorPaletteSection() {
  return (
    <AnimatedGradientSection className='py-24 text-on-surface'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline pb-2'>
          Color Palette
        </h2>

        <div className='space-y-8'>
          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Primary
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Primary'
                bg='bg-primary'
                text='text-on-primary'
              />
              <ColorCard
                name='On Primary'
                bg='bg-on-primary'
                text='text-primary'
                border='border'
              />
              <ColorCard
                name='Primary Container'
                bg='bg-primary-container'
                text='text-on-primary-container'
              />
              <ColorCard
                name='On Primary Container'
                bg='bg-on-primary-container'
                text='text-primary-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Secondary
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Secondary'
                bg='bg-secondary'
                text='text-on-secondary'
              />
              <ColorCard
                name='On Secondary'
                bg='bg-on-secondary'
                text='text-secondary'
                border='border'
              />
              <ColorCard
                name='Secondary Container'
                bg='bg-secondary-container'
                text='text-on-secondary-container'
              />
              <ColorCard
                name='On Secondary Container'
                bg='bg-on-secondary-container'
                text='text-secondary-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Tertiary
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Tertiary'
                bg='bg-tertiary'
                text='text-on-tertiary'
              />
              <ColorCard
                name='On Tertiary'
                bg='bg-on-tertiary'
                text='text-tertiary'
                border='border'
              />
              <ColorCard
                name='Tertiary Container'
                bg='bg-tertiary-container'
                text='text-on-tertiary-container'
              />
              <ColorCard
                name='On Tertiary Container'
                bg='bg-on-tertiary-container'
                text='text-tertiary-container'
              />
            </div>
          </div>

          <div>
            {' '}
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Success
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Success'
                bg='bg-success'
                text='text-on-success'
              />
              <ColorCard
                name='On Success'
                bg='bg-on-success'
                text='text-success'
                border='border'
              />
              <ColorCard
                name='Success Container'
                bg='bg-success-container'
                text='text-on-success-container'
              />
              <ColorCard
                name='On Success Container'
                bg='bg-on-success-container'
                text='text-success-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Warning
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Warning'
                bg='bg-warning'
                text='text-on-warning'
              />
              <ColorCard
                name='On Warning'
                bg='bg-on-warning'
                text='text-warning'
                border='border'
              />
              <ColorCard
                name='Warning Container'
                bg='bg-warning-container'
                text='text-on-warning-container'
              />
              <ColorCard
                name='On Warning Container'
                bg='bg-on-warning-container'
                text='text-warning-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Info
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Info'
                bg='bg-info'
                text='text-on-info'
              />
              <ColorCard
                name='On Info'
                bg='bg-on-info'
                text='text-info'
                border='border'
              />
              <ColorCard
                name='Info Container'
                bg='bg-info-container'
                text='text-on-info-container'
              />
              <ColorCard
                name='On Info Container'
                bg='bg-on-info-container'
                text='text-info-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Error
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Error'
                bg='bg-error'
                text='text-on-error'
              />
              <ColorCard
                name='On Error'
                bg='bg-on-error'
                text='text-error'
                border='border'
              />
              <ColorCard
                name='Error Container'
                bg='bg-error-container'
                text='text-on-error-container'
              />
              <ColorCard
                name='On Error Container'
                bg='bg-on-error-container'
                text='text-error-container'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Surfaces
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Background'
                bg='bg-background'
                text='text-on-background'
                border='border'
              />
              <ColorCard
                name='On Background'
                bg='bg-on-background'
                text='text-background'
              />
              <ColorCard
                name='Surface'
                bg='bg-surface'
                text='text-on-surface'
                border='border'
              />
              <ColorCard
                name='On Surface'
                bg='bg-on-surface'
                text='text-surface'
              />
              <ColorCard
                name='Surface Variant'
                bg='bg-surface-variant'
                text='text-on-surface-variant'
              />
              <ColorCard
                name='On Surface Variant'
                bg='bg-on-surface-variant'
                text='text-surface-variant'
              />
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-on-surface-variant uppercase tracking-wider mb-4'>
              Outline
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <ColorCard
                name='Outline'
                bg='bg-outline'
                text='text-surface'
              />
              <ColorCard
                name='Outline Variant'
                bg='bg-outline-variant'
                text='text-on-surface-variant'
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedGradientSection>
  )
}
