'use client'

import { motion } from 'motion/react'
import { CalendarPlus, Clock, MapPin, Navigation, Sun, Sunset } from 'lucide-react'
import {
  calendarUrl,
  directionsUrl,
  events,
  mapEmbedUrl,
  type WeddingEvent,
} from '@/lib/wedding'
import { Eyebrow, Ornament, Reveal } from './reveal'

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  const Icon = event.id === 'reception' ? Sunset : Sun

  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.1, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-t-[10rem] border border-gold/40 bg-card shadow-[0_30px_80px_-40px] shadow-primary/40"
      aria-labelledby={`${event.id}-title`}
    >
      <div className="flex flex-col items-center px-6 pb-8 pt-14 text-center sm:px-10">
        <motion.div
          initial={{ rotate: -90, opacity: 0 }}
          whileInView={{ rotate: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 + index * 0.15 }}
          className="flex size-14 items-center justify-center rounded-full bg-primary text-gold"
        >
          <Icon className="size-6" aria-hidden />
        </motion.div>
        <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-muted-foreground">
          {event.label}
        </p>
        <h3 id={`${event.id}-title`} className="mt-2 font-serif text-4xl text-primary sm:text-5xl">
          {event.title}
        </h3>

        <div className="mt-8 w-full border-y border-border py-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold">{event.timeLabel}</p>
          <p className="mt-2 flex items-center justify-center gap-2 font-serif text-3xl text-foreground">
            <Clock className="size-5 text-gold" aria-hidden />
            {event.time}
          </p>
          {event.note && (
            <p className="mt-3 text-sm text-muted-foreground">{event.note}</p>
          )}
        </div>

        <address className="mt-6 flex items-start gap-2 not-italic">
          <MapPin className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
          <span className="text-left">
            <span className="block font-serif text-2xl text-foreground">{event.venue}</span>
            <span className="block text-sm text-muted-foreground">{event.place}</span>
          </span>
        </address>
      </div>

      <div className="relative mx-4 mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted sm:mx-6">
        <iframe
          title={`Map showing ${event.venue}, ${event.place}`}
          src={mapEmbedUrl(event.mapQuery)}
          className="pointer-events-none md:pointer-events-auto absolute inset-0 h-full w-full grayscale-[35%] sepia-[15%] transition-[filter] duration-700 group-hover:grayscale-0 group-hover:sepia-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-6 sm:px-6">
        <a
          href={directionsUrl(event.mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Navigation className="size-4" aria-hidden />
          Directions
        </a>
        <a
          href={calendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-primary/30 px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-primary transition-colors hover:bg-secondary"
        >
          <CalendarPlus className="size-4" aria-hidden />
          Calendar
        </a>
      </div>
    </motion.article>
  )
}

export function Events() {
  return (
    <section id="celebrations" className="paper-grain px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <Reveal>
            <Eyebrow>The celebrations</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-serif text-5xl font-light text-primary sm:text-6xl">
              Sunday, <span className="italic text-gold">13 December 2026</span>
            </h2>
          </Reveal>
          <Ornament className="mt-8" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
