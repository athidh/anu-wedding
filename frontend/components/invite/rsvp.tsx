'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { submitRsvp } from '@/lib/rsvpApi'

type Attendance = 'attending' | 'declined'

const RsvpContext = createContext<() => void>(() => {})

export function useOpenRsvp() {
  return useContext(RsvpContext)
}

export function RsvpProvider({ children, showFloating }: { children: ReactNode; showFloating: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <RsvpContext.Provider value={() => setOpen(true)}>
      {children}
      <AnimatePresence>
        {showFloating && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-gold/60 bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-xl shadow-primary/30 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Mark your attendance
          </motion.button>
        )}
      </AnimatePresence>
      <RsvpDialog open={open} onClose={() => setOpen(false)} />
    </RsvpContext.Provider>
  )
}

function RsvpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()
  const nameId = useId()
  const wishId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [guests, setGuests] = useState(1)
  const [wish, setWish] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState<Attendance | null>(null)

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => nameRef.current?.focus(), 350)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) return setError('Please enter your full name (at least 2 characters).')
    if (!attendance) return setError('Please let us know if you can make it.')
    setError('')
    setIsSubmitting(true)

    try {
      await submitRsvp({
        name: trimmed,
        attending: attendance === 'attending',
        guests: attendance === 'attending' ? guests : 0,
        message: wish.trim(),
        website,
      })
      setSent(attendance)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to confirm attendance. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    onClose()
    if (sent) {
      setTimeout(() => {
        setSent(null)
        setName('')
        setGuests(1)
        setWish('')
        setWebsite('')
        setAttendance(null)
        setError('')
      }, 400)
    }
  }

  const choiceBase =
    'flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={handleClose}
            className="absolute inset-0 bg-primary/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92svh] w-full max-w-md overflow-y-auto rounded-3xl border border-gold/50 bg-card p-6 text-card-foreground shadow-2xl sm:p-8"
          >
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.25rem] border border-gold/20" />
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close attendance form"
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative py-6 text-center"
                >
                  <p className="text-[10px] uppercase tracking-[0.45em] text-gold">Thank you</p>
                  <h2 id={titleId} className="mt-4 font-serif text-4xl font-light text-primary">
                    {sent === 'attending' ? 'See you there' : 'You will be missed'}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
                    {sent === 'attending'
                      ? `Your attendance has been confirmed for ${guests} ${guests === 1 ? 'attendee' : 'attendees'}. We can't wait to celebrate with you!`
                      : 'Thank you for letting us know. You will be dearly missed!'}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-8 rounded-full border border-primary/30 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary transition-colors hover:bg-secondary"
                  >
                    Back to invitation
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {/* Honeypot field (hidden from view) */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.45em] text-gold">RSVP</p>
                  <h2 id={titleId} className="mt-2 pr-8 font-serif text-4xl font-light leading-tight text-primary">
                    Mark your attendance
                  </h2>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    Please confirm your presence so we can prepare the warmest welcome for you.
                  </p>

                  <label htmlFor={nameId} className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                    Your full name
                  </label>
                  <input
                    ref={nameRef}
                    id={nameId}
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arjun Menon"
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />

                  <fieldset className="mt-6">
                    <legend className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                      Will you attend?
                    </legend>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        aria-pressed={attendance === 'attending'}
                        onClick={() => setAttendance('attending')}
                        className={`${choiceBase} ${
                          attendance === 'attending'
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'border-border bg-background text-foreground hover:border-gold'
                        }`}
                      >
                        Will happily attend
                      </button>
                      <button
                        type="button"
                        aria-pressed={attendance === 'declined'}
                        onClick={() => setAttendance('declined')}
                        className={`${choiceBase} ${
                          attendance === 'declined'
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                            : 'border-border bg-background text-foreground hover:border-gold'
                        }`}
                      >
                        {"Sorry, I can't make it"}
                      </button>
                    </div>
                  </fieldset>

                  {/* Number of attendees (shown smoothly when attending is selected) */}
                  <AnimatePresence>
                    {attendance === 'attending' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                                Number of attendees
                              </label>
                              <span className="text-xs text-muted-foreground">
                                Including you (1 to 10)
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                disabled={guests <= 1 || isSubmitting}
                                className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-gold hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Decrease attendees"
                              >
                                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14" strokeLinecap="round" />
                                </svg>
                              </button>
                              <span className="w-6 text-center font-serif text-xl font-semibold text-primary">
                                {guests}
                              </span>
                              <button
                                type="button"
                                onClick={() => setGuests((g) => Math.min(10, g + 1))}
                                disabled={guests >= 10 || isSubmitting}
                                className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-gold hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Increase attendees"
                              >
                                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <label htmlFor={wishId} className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
                    Warm wishes <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    id={wishId}
                    name="wish"
                    rows={2}
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="A heartfelt wish for the couple..."
                    maxLength={300}
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />

                  <p role="alert" className="mt-3 min-h-5 text-sm text-destructive">
                    {error}
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative mt-2 w-full overflow-hidden rounded-xl border border-gold/60 bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold shadow-xl shadow-primary/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_35%,oklch(1_0_0/0.18)_50%,transparent_65%)] bg-[length:200%_100%]"
                    />
                    <span className="relative">{isSubmitting ? 'Confirming...' : 'Confirm attendance'}</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function RsvpButton({ className }: { className?: string }) {
  const openRsvp = useOpenRsvp()
  return (
    <button
      type="button"
      onClick={openRsvp}
      className={`rounded-full border border-gold bg-gold px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${className ?? ''}`}
    >
      Mark your attendance
    </button>
  )
}
