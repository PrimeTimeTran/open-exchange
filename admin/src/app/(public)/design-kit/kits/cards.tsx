export function CardsSection() {
  return (
    <section className='bg-background py-24'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline-variant pb-2'>
          Cards
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Simple Card */}
          <div className='bg-surface rounded-xl p-6 border border-outline-variant shadow-sm'>
            <h3 className='text-lg font-semibold mb-2'>Simple Card</h3>
            <p className='text-on-surface-variant text-sm'>
              This is a basic card component with a border and subtle shadow.
              Perfect for grouping related content.
            </p>
          </div>

          {/* Elevated Card */}
          <div className='bg-surface rounded-xl p-6 shadow-md border border-transparent'>
            <h3 className='text-lg font-semibold mb-2'>Elevated Card</h3>
            <p className='text-on-surface-variant text-sm'>
              This card uses elevation (shadow) instead of a border to separate
              it from the background.
            </p>
          </div>

          {/* Interactive Card */}
          <div className='bg-surface rounded-xl p-6 border border-outline-variant hover:shadow-md hover:border-primary transition-all cursor-pointer group'>
            <h3 className='text-lg font-semibold mb-2 group-hover:text-primary transition-colors'>
              Interactive Card
            </h3>
            <p className='text-on-surface-variant text-sm'>
              Hover over this card to see the interaction state. Useful for
              clickable items or links.
            </p>
          </div>

          {/* Hover Lift Card */}
          <div className='bg-surface rounded-xl p-6 border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'>
            <h3 className='text-lg font-semibold mb-2'>Hover Lift Card</h3>
            <p className='text-on-surface-variant text-sm'>
              This card lifts up and deepens its shadow on hover, providing a
              tactile feel of elevation.
            </p>
          </div>

          {/* Secondary Bg Card */}
          <div className='bg-secondary-container text-on-secondary-container rounded-xl p-6'>
            <h3 className='text-lg font-semibold mb-2'>Secondary Card</h3>
            <p className='text-sm opacity-90'>
              A card using the secondary container color for emphasis or
              differentiation.
            </p>
          </div>

          {/* Primary Bg Card */}
          <div className='bg-primary text-on-primary rounded-xl p-6 shadow-lg'>
            <h3 className='text-lg font-semibold mb-2'>Primary Card</h3>
            <p className='text-sm opacity-90'>
              High emphasis card using the primary color. Good for
              call-to-action sections.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
