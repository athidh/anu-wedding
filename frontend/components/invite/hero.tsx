'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { couple, weddingDate } from '@/lib/wedding'
import { useInviteOpened } from './invite-shell'

function Letters({ text, delay, on }: { text: string; delay: number; on: boolean }) {
  return (
    <span aria-label={text} className="inline-block">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: '0.6em', filter: 'blur(8px)' }}
          animate={on ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
          transition={{ delay: delay + i * 0.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero() {
  const on = useInviteOpened()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden bg-primary">
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.18 }}
          animate={on ? { scale: 1 } : undefined}
          transition={{ duration: 3.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <Image
            src="/images/cover.jpg"
            alt="Close-up of Anusmithin and Vijithra holding hands"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_35%]"
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/90" />

      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-20 text-center text-primary-foreground sm:pb-24"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.2em' }}
          animate={on ? { opacity: 1, letterSpacing: '0.5em' } : undefined}
          transition={{ duration: 1.6, delay: 0.4 }}
          className="mb-6 text-[11px] uppercase"
        >
          Together with their families
        </motion.p>

        <h1 className="font-serif text-6xl font-light leading-[0.9] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl">
          <Letters text={couple.groom} delay={0.6} on={on} />
          <span className="my-2 block font-serif text-4xl italic text-gold sm:text-5xl">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={on ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
              transition={{ delay: 1.2, duration: 1 }}
            >
              {'&'}
            </motion.span>
          </span>
          <Letters text={couple.bride} delay={1.4} on={on} />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={on ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 2.2, duration: 1 }}
          className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.35em]"
        >
          <span className="h-px w-10 bg-primary-foreground/60" />
          {weddingDate.weekday} · {weddingDate.day} {weddingDate.month} {weddingDate.year}
          <span className="h-px w-10 bg-primary-foreground/60" />
        </motion.div>

        <motion.div
          aria-hidden
          className="mt-12 h-12 w-px overflow-hidden bg-primary-foreground/25"
          initial={{ opacity: 0 }}
          animate={on ? { opacity: 1 } : undefined}
          transition={{ delay: 3 }}
        >
          <motion.span
            className="block h-1/2 w-full bg-primary-foreground"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
