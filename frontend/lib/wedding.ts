export const couple = {
  groom: 'Anusmithin',
  bride: 'Vijithra',
}

export const weddingDate = {
  weekday: 'Sunday',
  day: '13',
  month: 'December',
  year: '2026',
  muhurthamStartISO: '2026-12-13T09:30:00+05:30',
}

export type WeddingEvent = {
  id: string
  label: string
  title: string
  timeLabel: string
  time: string
  note?: string
  venue: string
  place: string
  mapQuery: string
  calendar: { start: string; end: string }
}

export const events: WeddingEvent[] = [
  {
    id: 'muhurtham',
    label: 'Morning',
    title: 'Wedding Ceremony',
    timeLabel: 'Muhurtham between',
    time: '9:30 am to 10:30 am',
    note: 'Wedding party departs at 7:00 am',
    venue: 'Cloud 7 Convention Centre',
    place: 'Keralaserry, Palakkad',
    mapQuery: 'Cloud 7 Convention Centre, Keralaserry, Palakkad, Kerala',
    calendar: { start: '20261213T040000Z', end: '20261213T050000Z' },
  },
  {
    id: 'reception',
    label: 'Evening',
    title: 'Reception',
    timeLabel: 'From',
    time: '5:00 pm to 8:30 pm',
    venue: 'Grand Auditorium',
    place: 'Chittur-Thathamangalam, Palakkad',
    mapQuery: 'Grand Auditorium, Chittur-Thathamangalam, Palakkad, Kerala',
    calendar: { start: '20261213T113000Z', end: '20261213T150000Z' },
  },
]

export function mapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
}

export function directionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

export function calendarUrl(event: WeddingEvent) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · ${couple.groom} & ${couple.bride}`,
    dates: `${event.calendar.start}/${event.calendar.end}`,
    location: `${event.venue}, ${event.place}`,
    details: event.note ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
