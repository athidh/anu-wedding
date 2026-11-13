import { Closing } from '@/components/invite/closing'
import { Countdown } from '@/components/invite/countdown'
import { Events } from '@/components/invite/events'
import { Hero } from '@/components/invite/hero'
import { Invitation } from '@/components/invite/invitation'
import { InviteShell } from '@/components/invite/invite-shell'

export default function Page() {
  return (
    <main>
      <InviteShell>
        <Hero />
        <Invitation />
        <Countdown />
        <Events />
        <Closing />
      </InviteShell>
    </main>
  )
}
