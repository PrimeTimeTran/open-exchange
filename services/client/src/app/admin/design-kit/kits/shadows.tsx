export function ShadowsSection() {
  return (
    <section className='bg-surface-variant py-24 text-on-surface-variant'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-on-secondary pb-2'>
          Shadows & Elevation
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
          <div className='p-6 rounded-lg bg-surface shadow-sm flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow SM</span>
          </div>
          <div className='p-6 rounded-lg bg-surface shadow-md flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow MD</span>
          </div>
          <div className='p-6 rounded-lg bg-surface shadow-lg flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow LG</span>
          </div>
          <div className='p-6 rounded-lg bg-surface shadow-xl flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow XL</span>
          </div>
          <div className='p-6 rounded-lg bg-surface shadow-2xl flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow 2XL</span>
          </div>
          <div className='p-6 rounded-lg bg-surface shadow-inner flex items-center justify-center h-32 border border-outline-variant/20'>
            <span className='text-sm font-medium'>Shadow Inner</span>
          </div>
        </div>
      </div>
    </section>
  )
}
