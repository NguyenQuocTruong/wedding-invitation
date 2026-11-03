import sourceAssets from '../data/template-02-assets.json'
import type { PreviewEvent } from './preview'

// Both invitations refer to the same original photo files; no duplicate uploads.
const album = [
  ['e4b94c3d-9821-4dca-b4d7-b78bc72f55ad', 'Ngày mình chung đôi', 'light'],
  ['6828f805-f97a-4308-a6f3-04084407558f', 'Một lời hẹn dịu dàng', 'light'],
  ['92ec3c7a-2d5e-42ac-be9d-7c437d357f2c', 'Bên nhau, từ đây về sau', 'light'],
  ['b51718d6-f726-400a-bdd8-d6191d8d7c48', 'Giữ lấy những bình yên', 'light'],
  [
    'c4ec7800-7b3d-4841-9eb9-ae2103602394',
    'Một nét Việt, một lời thương',
    'red',
  ],
  ['6c4f115a-6b5b-4091-afda-6d373dab1ded', 'Sắc son ngày hạnh phúc', 'red'],
  ['0f4c89f6-9a7b-4083-bb52-0d33e6c5eada', 'Nụ cười ngày chung đôi', 'red'],
  ['531ef084-ce2c-4922-bf3f-fa98c261f0f7', 'Trọn một lời yêu', 'red'],
  ['159afaf4-9b4f-480e-a829-42e63490f1bb', 'Cùng viết tiếp câu chuyện', 'red'],
] as const
const assets: Record<string, string> = sourceAssets
export const weddingPhotos: PreviewEvent['photos'] = album.map(
  ([id, label, group]) => ({
    src: assets[`uploads/3abf3d30-53da-41fd-8a54-520655162faa/${id}.webp`]!,
    label,
    alt: `Quốc Trưởng và Lâm Oanh ${group === 'red' ? 'trong trang phục cưới truyền thống' : 'trong bộ ảnh cưới áo trắng'} — ${label}`,
    group,
  }),
)
export const weddingHero = weddingPhotos[0]!.src

// Start paused; both invitations use the same user-controlled track.
export const weddingMusic =
  assets['mp3/3a627e88-dbcc-46bd-8b9d-160e5fe75e14.mp3'] || null
