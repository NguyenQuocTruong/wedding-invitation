# Confirmed wedding data

`src/data/wedding.json` is the canonical public record used by the invitation. Source reference: https://ngaychungdoi.com/w/zsl1gxdmebcc. The owner explicitly confirmed the following details; contradictory opening names and dates from the reference are not used.

- Groom: Quốc Trưởng. Parents: Nguyễn Văn Cường and Nguyễn Thị Miền. Family city: Hà Nội.
- Bride: Lâm Oanh. Parents: Nghiêm Thế Anh and Nguyễn Thị Mơ. Family city: Hà Nội.
- Saturday, 14 November 2026 (Vietnam time), corrected directly by the owner on 3 November: 09:00–10:00 Đón khách / chụp ảnh; 10:30–12:00 Dự tiệc; 13:00 Lễ thành hôn. This latest schedule overrides the source theme and the previous 10:00/13:30 times.
- All activities: Tư gia nhà gái, Xóm 4, Trung Lập, Phượng Dực, Hà Nội.
- Lunar date displayed exactly as confirmed: 06 tháng 10 năm Bính Ngọ. This date has not been independently verified.

The JSON contains `sourceUrl`, `couple` (`brideName`, `groomName`), `families` (`BRIDE` and `GROOM`, each with `label`, `fullName`, `parents`, `address`), and `events`. Each event has `id`, `title`, `time`, `dateTime`, `dateLabel`, `lunarDate`, `venue`, `address`, and `mapUrl`. Time ranges also have `endDateTime`. Event IDs are `welcome`, `meal` and `ceremony`; ISO timestamps include `+07:00`. The ceremony is the countdown target. Family `fullName` uses only the supplied name; no additional surname is inferred.

Map links search the supplied address in Google Maps; they do not represent an independently verified location pin. The design preview retains its separate sample content. Both public invitations use the confirmed factual data and the same real wedding photographs and music. Template 2 has a full RSVP popup with a chair-icon quick action; actual submission remains unavailable until a verified Google Sheets backend is configured. No RSVP data is submitted or stored by the unavailable form. Gift QR/account fields remain empty.
