import type { GuestSide } from '../types/rsvp'
interface PreviewPhoto {
  src: string
  alt: string
  label: string
  group: 'light' | 'red'
}
export interface WeddingActivity {
  id: string
  title: string
  time: string
  dateTime: string
  endDateTime?: string
  dateLabel: string
  lunarDate: string
  venue: string
  address: string
  mapUrl: string
}
export interface PreviewEvent {
  events?: WeddingActivity[]
  sampleContent?: boolean
  families?: Record<
    GuestSide,
    {
      label: string
      fullName: string
      parents: string[]
      address: string
    }
  >
  brideName: string
  groomName: string
  invitation: string
  dateTime: string
  timezone: string
  day: string
  monthLabel: string
  year: string
  dateLabel: string
  timeLabel: string
  venue: string
  address: string
  mapUrl: string
  hero: string
  musicSrc: string | null
  photos: PreviewPhoto[]
  gifts: Record<
    GuestSide,
    { label: string; bank: string; recipient: string; image: string }
  >
}
export const previewEvent: PreviewEvent = {
  brideName: 'Cô dâu',
  groomName: 'Chú rể',
  invitation: 'Một lời mời, một ngày chung đôi.',
  dateTime: '2027-11-20T17:00:00+07:00',
  timezone: 'Asia/Ho_Chi_Minh',
  day: '20',
  monthLabel: 'THÁNG MƯỜI MỘT',
  year: '2027',
  dateLabel: '20 tháng 11, 2027',
  timeLabel: '17:00 · Thứ Bảy',
  venue: 'Khu vườn Hạnh Phúc',
  address: 'Địa điểm minh họa · Thành phố Hồ Chí Minh',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City',
  hero: '/design-preview/portrait.svg',
  musicSrc: null as string | null,
  photos: [
    {
      src: '/design-preview/portrait.svg',
      alt: 'Minh họa đôi uyên ương trong trang phục trắng và đen',
      label: 'Chúng mình',
      group: 'light',
    },
    {
      src: '/design-preview/floral.svg',
      alt: 'Minh họa đôi uyên ương bên khung hoa trắng',
      label: 'Những điều dịu dàng',
      group: 'light',
    },
    {
      src: '/design-preview/detail.svg',
      alt: 'Minh họa bó hoa cưới trắng trên nền ngọc trai',
      label: 'Một chút thương, một đời nhớ',
      group: 'light',
    },
    {
      src: '/design-preview/traditional.svg',
      alt: 'Minh họa cặp đôi mặc cổ phục đỏ trên nền đỏ',
      label: 'Một nét Việt, một lời hẹn',
      group: 'red',
    },
  ],
  gifts: {
    BRIDE: {
      label: 'Cô dâu',
      bank: 'Ngân hàng mẫu',
      recipient: 'CÔ DÂU — DEMO',
      image: '/design-preview/bride-qr.svg',
    },
    GROOM: {
      label: 'Chú rể',
      bank: 'Ngân hàng mẫu',
      recipient: 'CHÚ RỂ — DEMO',
      image: '/design-preview/groom-qr.svg',
    },
  } satisfies Record<
    GuestSide,
    { label: string; bank: string; recipient: string; image: string }
  >,
}
