# Match floating controls to the user's screenshot

The user explicitly rejects the reserved footer and requests the button style and placement shown in the screenshot, with attention-grabbing vertical bounce. Apply to both invitations.

- Replace the footer band with transparent, non-intercepting overlay bounds. Music is a small gray translucent pill at the upper right, with white signal bars. Gift and directions are round gray translucent controls at the lower right, gift on the left, directions on the right. Keep icon-only visuals with accessible names and 44px minimum touch targets.
- Apply gentle staggered vertical bounces to all three buttons, pause while hovered/focused/pressed, and disable nonessential animations when the device requests reduced motion. Equalizer bars still animate only during actual playback.
- Keep the real map link, existing gift dialog, and paused-by-default audio. Preserve both timelines/countdowns and preview behavior. Constrain template 2's overlay to its 430px invitation column on wide displays.
- Make the invitation viewport full height, keep safe-area offsets, and add scroll-end breathing room so the final links can be moved above the controls. The requested floating placement intentionally overlays the invitation, replacing the prior reserved row.
- Update existing browser checks for the reference positions, animation/reduced-motion, music, gifts, map, scroll and opening/replay. Run lint, types, unit tests, build and browser checks; deploy the verified commit to the existing Vercel project and check both public links.
