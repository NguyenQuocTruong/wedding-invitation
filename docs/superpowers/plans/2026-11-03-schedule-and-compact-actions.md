# Wedding schedule and compact actions implementation plan

> Execute inline using superpowers:executing-plans, then request a focused review.

**Goal:** Add a clear wedding timeline and consistent live countdown to both invitations, and make music, gifts and directions compact without obscuring the invitation.

**Architecture:** Shared schedule/countdown components consume the confirmed event configuration. A shared viewport frame reserves a bottom row for the glass actions; the invitation scrolls in the row above it. This avoids covering content at every scroll position, unlike adding padding only at the end of a fixed overlay. Keep existing envelope animations, photographs and original template 2 canvas layout.

**Tech stack:** Existing Vue 3 / TypeScript / Vite; CSS and native dialogs, no new runtime dependencies.

## Requirements and choices

- Timeline uses only confirmed events: 10:00 Bữa cơm thân mật and 13:30 Lễ thành hôn on 14 November 2026, at Tư gia nhà gái, Xóm 4, Trung Lập, Phượng Dực, Hà Nội.
- Countdown uses 2026-11-14T13:30:00+07:00, updates every second, clamps expiry and shows a meaningful event-day message. Reuse both templates' existing countdown positions, without duplicate timers.
- Reference images inform fine line icons, alternating timeline, quiet sage typography and small frosted controls. Reserve a real footer row so controls never overlap content. This compact horizontal footer is an implementation choice to address the reported overlap.
- Three matching controls: equalizer music, gift, map. Music starts paused and downloads on interaction; animated bars only while playing, with reduced motion respected.
- Shared gift modal displays truthful pending information until actual bank details/QR are provided; no sample payment details or false RSVP success.
- Preserve /design-preview behavior; production pages gain the reserved frame. Keep scroll navigation, replay, focus and all native dialogs working.

## Task 1: Confirmed timeline and countdown

- [ ] Add a browser check with frozen time for timeline content, countdown ticking/expiry and no duplicates on both routes; run before implementation to confirm the missing timeline.
- [ ] Create WeddingTimeline.vue and WeddingCountdown.vue. Use the existing event data; adapt CountdownTimer.vue and the template 2 countdown node.
- [ ] Integrate timeline into each opened invitation and keep the original absolute canvas untouched.

## Task 2: Compact glass controls with reserved space

- [ ] Update browser checks for three controls, clear map/gift actions, no content/dock overlap before and after opening, scroll/replay, keyboard focus and safe-area bounds.
- [ ] Create InvitationFrame.vue and GiftDialog.vue; update FloatingActions.vue and both pages. Keep preview outside the viewport frame.
- [ ] Run lint, typecheck, unit tests, build and browser checks at 320/375/390/768/1440 widths. Inspect screenshots; verify actual audio play/pause, reduced-motion and gift dialog behavior.
- [ ] Request focused review, integrate verified files into remote main without overwriting prior changes, deploy the exact commit to the existing production project and verify both public URLs.

## Review focus

Small/landscape viewports and iOS dynamic/safe-area height; nested scroll anchors and replay/focus; template 2 scaled canvas; countdown after expiry; unavailable gift details without exposing sample data.
