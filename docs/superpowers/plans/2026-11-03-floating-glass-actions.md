# Shared floating glass actions

User requests one consistent vertical dock at the lower right for both invitations, thin outlined rounded glass controls, an animated signal-bar music icon instead of a speaker, a clear directions control, and removal of the effects button.

- Share FloatingActions.vue on both production pages. Use a translucent light glass surface, blur, fine edge highlights, visible labels, keyboard focus and safe-area offsets.
- Start audio paused; fetch/play only after the music button is pressed. Reuse the existing local music file for both invitations. Animate the four signal bars while playback is active, keep them static on pause and with prefers-reduced-motion.
- Use the confirmed map URL for the directions link. Remove duplicate navbar/legacy floating music controls and both effects buttons. Preserve the device motion preference.
- Verify both routes at 375/390/768/1440 widths, opening overlay stacking, dock position and common styles, actual play/pause, map links and reduced-motion behavior. Run required checks, then deploy the verified commit to the existing Vercel project.
