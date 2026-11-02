import { previewEvent, type PreviewEvent } from './preview'

// Owner-authorized fictional content for layout review; replace before inviting guests.
// RSVP stays unavailable until a separate backend integration is verified.
export const event: PreviewEvent & { rsvpEnabled: false } = {
  sampleContent: true,
  brideName: 'Minh Anh',
  groomName: 'Quốc Bảo',
  invitation: 'Một lời mời, một ngày chung đôi.',
  dateTime: '2027-11-20T17:00:00+07:00',
  timezone: 'Asia/Ho_Chi_Minh',
  day: '20',
  monthLabel: 'THÁNG MƯỜI MỘT',
  year: '2027',
  dateLabel: '20 tháng 11, 2027',
  timeLabel: '17:00 · Thứ Bảy',
  venue: 'Vườn Hạnh Phúc',
  address: '123 Đường Hoa, Thành phố Hồ Chí Minh · Địa chỉ mẫu',
  mapUrl: '',
  hero: '/design-preview/portrait.svg',
  musicSrc: null,
  photos: previewEvent.photos.map((photo) => ({ ...photo })),
  rsvpEnabled: false,
  families: {
    BRIDE: {
      label: 'Nhà gái',
      fullName: 'Nguyễn Minh Anh',
      parents: ['Ông Nguyễn Văn Minh', 'Bà Lê Thị Thanh'],
      address: '25 Đường Hoa Mai, Thành phố Hồ Chí Minh',
    },
    GROOM: {
      label: 'Nhà trai',
      fullName: 'Trần Quốc Bảo',
      parents: ['Ông Trần Văn Hùng', 'Bà Phạm Thị Lan'],
      address: '68 Đường Hướng Dương, Thành phố Hồ Chí Minh',
    },
  },
  gifts: {
    BRIDE: { label: 'Cô dâu', image: '', recipient: '', bank: '' },
    GROOM: { label: 'Chú rể', image: '', recipient: '', bank: '' },
  },
}
