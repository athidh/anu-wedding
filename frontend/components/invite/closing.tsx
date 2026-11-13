'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { couple } from '@/lib/wedding'
import { Eyebrow, Reveal } from './reveal'
import { RsvpButton } from './rsvp'

const sparkles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${30 + ((i * 53) % 65)}%`,
  delay: `${(i * 0.9) % 12}s`,
  size: 3 + (i % 3) * 2,
}))

export function Closing() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1])

  return (
    <section ref={ref} className="relative flex min-h-[90svh] items-end overflow-hidden bg-primary">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src="/images/walk.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/10" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {sparkles.map((s, i) => (
          <span
            key={i}
            className="absolute animate-drift rounded-full bg-gold"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-6 pb-20 text-center text-primary-foreground">
        <Reveal>
          <Eyebrow>With love</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-balance font-serif text-3xl font-light leading-snug sm:text-4xl">
            Your presence and blessings would make our day complete.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-10 font-serif text-2xl italic text-gold">Family and Friends</p>
        </Reveal>
        <Reveal delay={0.25}>
          <RsvpButton className="mt-10" />
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-16 font-serif text-5xl font-light sm:text-6xl">
            {couple.groom[0]}
            <span className="mx-2 italic text-gold">{'&'}</span>
            {couple.bride[0]}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.45em] text-primary-foreground/60">
            13 · 12 · 2026
          </p>
        </Reveal>
      </div>
    </section>
  )
}
