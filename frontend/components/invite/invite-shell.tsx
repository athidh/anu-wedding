'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { IntroGate } from './intro-gate'
import { RsvpProvider } from './rsvp'

const OpenedContext = createContext(false)

export function useInviteOpened() {
  return useContext(OpenedContext)
}

export function InviteShell({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false)

  const handleOpen = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    setOpened(true)
  }

  return (
    <OpenedContext.Provider value={opened}>
      <IntroGate open={opened} onOpen={handleOpen} />
      <RsvpProvider showFloating={opened}>{children}</RsvpProvider>
    </OpenedContext.Provider>
  )
}
