export function AlertsSection() {
  return (
    <section className='bg-surface-variant py-24 text-on-surface-variant'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline pb-2'>
          Alerts & Feedback
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Error Alert */}
          <div className='bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3 border border-error/20'>
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>Error</h4>
              <p className='text-sm opacity-90 mt-1'>
                Something went wrong! Please try again later.
              </p>
            </div>
          </div>

          {/* Success Style */}
          <div className='bg-success-container text-on-success-container p-4 rounded-lg flex items-start gap-3 border border-success/20'>
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>Success</h4>
              <p className='text-sm opacity-90 mt-1'>
                Operation completed successfully. This uses the new success
                tokens.
              </p>
            </div>
          </div>

          {/* Warning Style */}
          <div className='bg-warning-container text-on-warning-container p-4 rounded-lg flex items-start gap-3 border border-warning/20'>
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>Warning</h4>
              <p className='text-sm opacity-90 mt-1'>
                Please review your inputs before proceeding.
              </p>
            </div>
          </div>

          {/* Primary Info */}
          <div className='bg-info-container text-on-info-container p-4 rounded-lg flex items-start gap-3 border border-info/20'>
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>Information</h4>
              <p className='text-sm opacity-90 mt-1'>
                Here is some important information for the user. Uses info
                tokens.
              </p>
            </div>
          </div>

          {/* Secondary / Neutral */}
          <div className='bg-secondary-container text-on-secondary-container p-4 rounded-lg flex items-start gap-3 border border-secondary/20'>
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>Note</h4>
              <p className='text-sm opacity-90 mt-1'>
                A neutral note or warning using secondary colors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
