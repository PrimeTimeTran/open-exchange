export function BorderRadiusSection() {
  return (
    <section className='bg-background py-24'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline-variant pb-2'>
          Border Radius
        </h2>
        <div className='space-y-4'>
          <div className='flex items-center gap-4'>
            <div className='w-24 h-24 bg-primary-container rounded-sm flex items-center justify-center text-on-primary-container'>
              SM
            </div>
            <span className='text-sm text-on-surface-variant'>
              --radius-sm (8px)
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='w-24 h-24 bg-primary-container rounded-md flex items-center justify-center text-on-primary-container'>
              MD
            </div>
            <span className='text-sm text-on-surface-variant'>
              --radius-md (12px)
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='w-24 h-24 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container'>
              LG
            </div>
            <span className='text-sm text-on-surface-variant'>
              --radius-lg (16px)
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='w-24 h-24 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container'>
              XL
            </div>
            <span className='text-sm text-on-surface-variant'>
              --radius-xl (28px)
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
