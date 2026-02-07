import { Button, ParallaxSection } from '@/components/ui'

export function ButtonsPillsSection() {
  return (
    <ParallaxSection className='bg-background'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline-variant pb-2'>
          Buttons & Pills
        </h2>

        <div className='space-y-12'>
          {/* Variants */}
          <div className='space-y-6'>
            <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
              Variants
            </h3>
            <div className='flex flex-wrap gap-4 items-center'>
              <Button variant='primary'>Primary</Button>
              <Button variant='secondary'>Secondary</Button>
              <Button variant='outline'>Outline</Button>
              <Button variant='ghost'>Ghost</Button>
              <Button variant='link'>Link</Button>
            </div>
          </div>

          {/* Semantic Colors */}
          <div className='space-y-6'>
            <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
              Semantic Colors
            </h3>
            <div className='flex flex-wrap gap-4 items-center'>
              <Button variant='primary'>Primary</Button>
              <Button variant='success'>Success</Button>
              <Button variant='warning'>Warning</Button>
              <Button variant='destructive'>Destructive</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className='space-y-6'>
            <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
              Sizes
            </h3>
            <div className='flex flex-wrap gap-4 items-center'>
              <Button size='lg'>Large</Button>
              <Button size='md'>Default</Button>
              <Button size='sm'>Small</Button>
              <Button size='icon'>
                <span className='h-4 w-4 flex items-center justify-center'>
                  ?
                </span>
              </Button>
            </div>
          </div>

          {/* Pills / Badges */}
          <div className='space-y-6'>
            <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
              Pills
            </h3>
            <div className='flex flex-wrap gap-4'>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-container text-on-primary-container'>
                Primary
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-container text-on-secondary-container'>
                Secondary
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tertiary-container text-on-tertiary-container'>
                Tertiary
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-container text-on-success-container'>
                Success
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-container text-on-warning-container'>
                Warning
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-container text-on-error-container'>
                Error
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface-variant text-on-surface-variant'>
                Surface Variant
              </span>
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
  )
}
