import { Progress, Spinner, Skeleton } from '@/components/ui'

export function FeedbackSection() {
  return (
    <section className='bg-background py-24'>
      <div className='container mx-auto px-6 space-y-8'>
        <h2 className='text-2xl font-semibold border-b border-outline-variant pb-2'>
          Feedback & Loading
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
          {/* Progress & Spinners */}
          <div className='space-y-8'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
                Progress Bars
              </h3>
              <div className='space-y-6'>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>Downloading...</span>
                    <span>33%</span>
                  </div>
                  <Progress value={33} />
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>Processing...</span>
                    <span>66%</span>
                  </div>
                  <Progress value={66} />
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-xs'>
                    <span>Completed</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
                Spinners
              </h3>
              <div className='flex items-center gap-8'>
                <Spinner size='sm' />
                <Spinner size='md' />
                <Spinner size='lg' />
              </div>
            </div>
          </div>

          {/* Skeletons */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium uppercase tracking-wider mb-4'>
              Skeletons
            </h3>
            <div className='flex flex-col space-y-3'>
              <Skeleton className='h-[125px] w-full rounded-xl' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[250px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
            </div>

            <div className='flex items-center space-x-4 pt-8'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[250px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
