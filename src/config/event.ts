import { previewEvent, type PreviewEvent } from './preview'
import wedding from '../data/wedding.json'

const ceremony = wedding.events[1]!

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
  timeLabel: '13:30 · Thứ Bảy',
  venue: ceremony.venue,
  address: ceremony.address,
  mapUrl: ceremony.mapUrl,
  events: wedding.events,
  hero: '/design-preview/portrait.svg',
  musicSrc: null,
  photos: previewEvent.photos.map((photo) => ({ ...photo })),
  rsvpEnabled: false,
  families: wedding.families,
  gifts: {
    BRIDE: { label: 'Cô dâu', image: '', recipient: '', bank: '' },
    GROOM: { label: 'Chú rể', image: '', recipient: '', bank: '' },
  },
}
