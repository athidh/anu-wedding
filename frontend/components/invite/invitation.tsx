'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Eyebrow, Ornament, Reveal } from './reveal'

export function Invitation() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const scale = useTransform(scrollYProgress, [0.05, 0.4], [0.92, 1])

  return (
    <section ref={ref} className="paper-grain relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-20">
        <div className="order-2 text-center md:order-1 md:text-left">
          <Reveal>
            <Eyebrow>You are invited</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 text-balance font-serif text-5xl font-light leading-tight text-primary sm:text-6xl">
              to celebrate <span className="italic text-gold">our wedding</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-md text-pretty font-serif text-2xl leading-relaxed text-foreground/80 md:mx-0">
              With the blessings of our parents and elders, we joyfully invite you to share in the
              beginning of our forever.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Ornament className="mt-10 md:justify-start" />
          </Reveal>
        </div>

        <div className="order-1 mx-auto w-full max-w-sm md:order-2">
          <motion.div
            style={{ scale }}
            className="relative aspect-[3/4] overflow-hidden rounded-t-full shadow-2xl shadow-primary/20"
          >
            <motion.div style={{ y: imgY }} className="absolute -inset-y-[10%] inset-x-0">
              <Image
                src="/images/peek.jpg"
                alt="The couple laughing as they walk hand in hand, seen through soft green leaves"
                fill
                sizes="(min-width: 768px) 24rem, 90vw"
                className="object-cover object-[45%_50%]"
              />
            </motion.div>
          </motion.div>
          <div className="mx-auto -mt-px h-3 w-[86%] rounded-b-full bg-gold/30" aria-hidden />
        </div>
      </div>
    </section>
  )
}
