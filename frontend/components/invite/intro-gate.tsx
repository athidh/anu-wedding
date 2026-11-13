'use client'

import { AnimatePresence, motion } from 'motion/react'
import { couple, weddingDate } from '@/lib/wedding'

const ease = [0.76, 0, 0.24, 1] as const

export function IntroGate({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          key="gate"
          onClick={onOpen}
          className="fixed inset-0 z-50 flex h-full w-full cursor-pointer select-none"
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 1.2 }}
        >
          <motion.div
            className="paper-grain h-full w-1/2 border-r border-gold/40 bg-secondary"
            exit={{ x: '-100%' }}
            transition={{ duration: 1.1, ease }}
          />
          <motion.div
            className="paper-grain h-full w-1/2 border-l border-gold/40 bg-secondary"
            exit={{ x: '100%' }}
            transition={{ duration: 1.1, ease }}
          />

          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] uppercase tracking-[0.45em] text-muted-foreground">
              The wedding of
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpen()
              }}
              className="group relative my-8 flex size-40 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95 sm:my-10 sm:size-52"
              aria-label="Open the invitation"
            >
              <span className="absolute inset-0 rounded-full border border-gold/60 pointer-events-none" />
              <motion.span
                className="absolute inset-2 rounded-full border border-dashed border-gold/50 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <span className="absolute inset-4 rounded-full bg-primary shadow-[0_20px_60px_-15px] shadow-primary/60 transition-transform duration-500 group-hover:scale-105 pointer-events-none sm:inset-5" />
              <span className="relative font-serif text-5xl italic text-primary-foreground pointer-events-none sm:text-6xl">
                {couple.groom[0]}
                <span className="mx-1 text-3xl text-gold">{'&'}</span>
                {couple.bride[0]}
              </span>
            </button>

            <h1 className="font-serif text-4xl font-light text-foreground sm:text-5xl">
              {couple.groom} <span className="italic text-gold">{'&'}</span> {couple.bride}
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {weddingDate.day} · {weddingDate.month} · {weddingDate.year}
            </p>

            <p
              onClick={(e) => {
                e.stopPropagation()
                onOpen()
              }}
              className="mt-12 text-[11px] uppercase tracking-[0.4em] text-primary cursor-pointer sm:mt-14 active:opacity-70"
            >
              Tap the seal to open
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
