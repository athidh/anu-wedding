'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'

interface MusicPlayerProps {
  open: boolean
}

export function MusicPlayer({ open }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Start playback when the invitation is opened by the user
  useEffect(() => {
    if (!open) return
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.6
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
        })
        .catch((err) => {
          console.warn('Autoplay prevented by browser, waiting for user toggle:', err)
          setIsPlaying(false)
        })
    }
  }, [open])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.volume = 0.6
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error('Audio playback error:', err)
            setIsPlaying(false)
          })
      }
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/bg-music.mp3"
        preload="auto"
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 right-4 z-40 sm:top-6 sm:right-6"
          >
            <button
              type="button"
              onClick={toggleMusic}
              className="group relative flex size-11 items-center justify-center rounded-full border border-gold/50 bg-primary/85 text-gold shadow-lg shadow-black/25 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-gold hover:bg-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:size-12 cursor-pointer"
              aria-label={isPlaying ? 'Mute background music' : 'Unmute background music'}
              title={isPlaying ? 'Mute background music' : 'Unmute background music'}
            >
              {/* Rotating dashed ring when music is playing */}
              {isPlaying && (
                <motion.span
                  className="pointer-events-none absolute inset-[-3px] rounded-full border border-dashed border-gold/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Pulsing subtle gold glow when playing */}
              {isPlaying && (
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gold/10 animate-pulse" />
              )}

              {/* Icon toggle */}
              {isPlaying ? (
                <Volume2 className="size-5 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <VolumeX className="size-5 opacity-75 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
