import type { PreviewEvent } from './preview'
import { weddingHero, weddingPhotos, weddingMusic } from './weddingMedia'
import wedding from '../data/wedding.json'

const ceremony = wedding.events.find((activity) => activity.id === 'ceremony')!

// Confirmed public invitation content; RSVP remains unavailable pending backend setup.
export const event: PreviewEvent & { rsvpEnabled: false } = {
  sampleContent: false,
  ...wedding.couple,
  invitation: 'Một lời mời, một ngày chung đôi.',
  dateTime: ceremony.dateTime,
  timezone: 'Asia/Ho_Chi_Minh',
  day: '14',
  monthLabel: 'THÁNG MƯỜI MỘT',
  year: '2026',
  dateLabel: '14 tháng 11, 2026',
  timeLabel: `${ceremony.time} · Thứ Bảy`,
  venue: ceremony.venue,
  address: ceremony.address,
  mapUrl: ceremony.mapUrl,
  events: wedding.events,
  hero: weddingHero,
  musicSrc: weddingMusic,
  photos: weddingPhotos,
  rsvpEnabled: false,
  families: wedding.families,
  gifts: {
    BRIDE: { label: 'Cô dâu', image: '', recipient: '', bank: '' },
    GROOM: { label: 'Chú rể', image: '', recipient: '', bank: '' },
  },
}
