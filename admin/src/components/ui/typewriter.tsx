'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TypewriterProps {
  strings: string[]
  className?: string
  cursorClassName?: string
  typeSpeed?: number
  deleteSpeed?: number
  delayBetween?: number
}

export function Typewriter({
  strings,
  className,
  cursorClassName,
  typeSpeed = 50,
  deleteSpeed = 30,
  delayBetween = 2000,
}: TypewriterProps) {
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(typeSpeed)

  useEffect(() => {
    const i = loopNum % strings.length
    const fullText = strings[i]

    const handleType = () => {
      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1),
      )

      setTypingSpeed(isDeleting ? deleteSpeed : typeSpeed)

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), delayBetween)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleType, typingSpeed)

    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, strings, typeSpeed, deleteSpeed, delayBetween])

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span>{text}</span>
      <span
        className={cn(
          'ml-1 h-4 w-[2px] animate-pulse bg-primary',
          cursorClassName,
        )}
      />
    </span>
  )
}
