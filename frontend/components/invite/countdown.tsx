'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { weddingDate } from '@/lib/wedding'
import { Eyebrow, Reveal } from './reveal'

const target = new Date(weddingDate.muhurthamStartISO).getTime()

function getParts(now: number) {
  const diff = Math.max(0, target - now)
  return {
    Days: Math.floor(diff / 86_400_000),
    Hours: Math.floor((diff / 3_600_000) % 24),
    Minutes: Math.floor((diff / 60_000) % 60),
    Seconds: Math.floor((diff / 1000) % 60),
  }
}

function Unit({ label, value }: { label: string; value: number | null }) {
  const display = value === null ? '--' : String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-12 overflow-hidden sm:h-20">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="block font-serif text-4xl font-light tabular-nums text-primary-foreground sm:text-6xl md:text-7xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] uppercase tracking-[0.35em] text-primary-foreground/60">
        {label}
      </span>
    </div>
  )
}

export function Countdown() {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const parts = now === null ? null : getParts(now)

  return (
    <section className="relative overflow-hidden bg-primary px-6 py-24 text-center sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20"
      />

      <Reveal>
        <Eyebrow>Save the date</Eyebrow>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
        <span className="font-serif text-xl uppercase tracking-[0.3em] text-primary-foreground/80 sm:text-2xl">
          {weddingDate.weekday}
        </span>
        <span className="gold-text animate-shimmer font-serif text-8xl font-light leading-none sm:text-9xl">
          {weddingDate.day}
        </span>
        <span className="font-serif text-xl uppercase tracking-[0.3em] text-primary-foreground/80 sm:text-2xl">
          Dec
          <br />
          {weddingDate.year}
        </span>
      </Reveal>

      <Reveal delay={0.2}>
        <div
          className="relative mx-auto mt-14 grid max-w-2xl grid-cols-4 gap-2 border-y border-gold/30 py-8"
          role="timer"
          aria-live="off"
        >
          {(['Days', 'Hours', 'Minutes', 'Seconds'] as const).map((k) => (
            <Unit key={k} label={k} value={parts ? parts[k] : null} />
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mt-6 font-serif text-lg italic text-primary-foreground/70">
          until the muhurtham
        </p>
      </Reveal>
    </section>
  )
}
