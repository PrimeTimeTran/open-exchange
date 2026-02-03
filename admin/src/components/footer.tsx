export function Footer() {
  return (
    <footer className='w-full border-t border-zinc-200 dark:border-zinc-800'>
      <div className='mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Left */}
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          © {new Date().getFullYear()} AI Agent Marketplace. All rights
          reserved.
        </p>

        {/* Right */}
        <div className='flex items-center space-x-6 text-sm'>
          <a
            href='/privacy'
            className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition'
          >
            Privacy
          </a>
          <a
            href='/terms'
            className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition'
          >
            Terms
          </a>
          <a
            href='/contact'
            className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition'
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
