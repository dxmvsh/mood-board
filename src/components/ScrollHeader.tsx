'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
}

export default function ScrollHeader({ children }: Props) {
  const [visible, setVisible] = useState(false)
  const lastScroll = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const THRESHOLD = 10

    function handleScroll() {
      const current = window.scrollY

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = current - lastScroll.current

          if (Math.abs(diff) > THRESHOLD) {
            if (diff > 0) {
              // вниз
              setVisible(true)
            } else {
              // вверх
              setVisible(false)
            }

            lastScroll.current = current
          }

          ticking.current = false
        })

        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
    >
      {children}
    </div>
  )
}