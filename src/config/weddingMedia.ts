import sourceAssets from '../data/template-02-assets.json'
import type { PreviewEvent } from './preview'

// Real wedding photos uploaded by couple (located in /images/wedding-photos/)
const album = [
  ['/images/wedding-photos/wedding-hero.jpeg', 'Ngày mình chung đôi', 'light'],
  [
    '/images/wedding-photos/white-dress-01.jpeg',
    'Một lời hẹn dịu dàng',
    'light',
  ],
  [
    '/images/wedding-photos/white-dress-02.jpeg',
    'Bên nhau, từ đây về sau',
    'light',
  ],
  [
    '/images/wedding-photos/white-dress-03.jpeg',
    'Giữ lấy những bình yên',
    'light',
  ],
  [
    '/images/wedding-photos/white-dress-04.jpeg',
    'Nụ cười ngày chung đôi',
    'light',
  ],
  [
    '/images/wedding-photos/traditional-red-01.jpeg',
    'Một nét Việt, một lời thương',
    'red',
  ],
  [
    '/images/wedding-photos/traditional-red-02.jpeg',
    'Sắc son ngày hạnh phúc',
    'red',
  ],
  ['/images/wedding-photos/traditional-red-03.jpeg', 'Trọn một lời yêu', 'red'],
  [
    '/images/wedding-photos/traditional-red-04.jpeg',
    'Cùng viết tiếp câu chuyện',
    'red',
  ],
  [
    '/images/wedding-photos/traditional-red-05.jpeg',
    'Duyên nợ trăm năm',
    'red',
  ],
  [
    '/images/wedding-photos/traditional-red-06.jpeg',
    'Hạnh phúc đong đầy',
    'red',
  ],
  [
    '/images/wedding-photos/traditional-red-07.jpeg',
    'Bình yên bên nhau',
    'red',
  ],
] as const
const assets: Record<string, string> = sourceAssets
export const weddingPhotos: PreviewEvent['photos'] = album.map(
  ([path, label, group]) => ({
    src: path,
    label,
    alt: `Quốc Trưởng và Lâm Oanh ${group === 'red' ? 'trong trang phục cưới truyền thống' : 'trong bộ ảnh cưới áo trắng'} — ${label}`,
    group,
  }),
)
export const weddingHero = weddingPhotos[0]!.src

// Start paused; both invitations use the same user-controlled track.
export const weddingMusic =
  assets['mp3/3a627e88-dbcc-46bd-8b9d-160e5fe75e14.mp3'] || null
