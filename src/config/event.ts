import type { PreviewEvent } from './preview'

// Public production content. Fill only with confirmed information and media.
// RSVP stays unavailable until a separate backend integration is verified.
export const event: PreviewEvent & { rsvpEnabled: false } = {
  brideName: 'Cô dâu',
  groomName: 'Chú rể',
  invitation: 'Một lời mời, một ngày chung đôi.',
  dateTime: '',
  timezone: 'Asia/Ho_Chi_Minh',
  day: '—',
  monthLabel: 'NGÀY CHUNG ĐÔI',
  year: '',
  dateLabel: 'Ngày cưới sẽ được cập nhật',
  timeLabel: 'Giờ tổ chức sẽ được cập nhật',
  venue: 'Địa điểm sẽ được cập nhật',
  address: '',
  mapUrl: '',
  hero: '/design-preview/portrait.svg',
  musicSrc: null,
  photos: [],
  rsvpEnabled: false,
  gifts: {
    BRIDE: { label: 'Cô dâu', image: '', recipient: '', bank: '' },
    GROOM: { label: 'Chú rể', image: '', recipient: '', bank: '' },
  },
}
