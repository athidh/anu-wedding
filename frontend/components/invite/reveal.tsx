'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Ornament({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={`flex items-center justify-center gap-3 text-gold ${className ?? ''}`}
      initial={{ opacity: 0, scaleX: 0.3 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10Z" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold" />
    </motion.div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-gold">{children}</p>
  )
}
