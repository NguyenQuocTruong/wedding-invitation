# Interactive design preview implementation plan

Goal: complete Template 01 at /design-preview without changing the root page.
Spec: user-approved UI_UX_PROPOSAL.md section 15 and current interactive-preview brief.
Architecture: exact-path lazy page, preview-only components and CSS, explicit Vercel rewrite.
Constraints: no backend requests, persistence, real QR, autoplay, production deployment or main merge.

- [x] Test route resolution and countdown edge cases before implementation.
- [x] Build configurable preview, original illustrated media, eight components and reveal composable.
- [x] Verify mock form, envelope, image dialog, QR download and music demo in browser.
- [x] Check 375/390/768/1440 widths, reduced motion, root isolation and console.
- [x] Run lint, format, typecheck, tests and build.
- [ ] Push feature branch and request PR; GitHub API access currently returns Forbidden.
      Review focus: false success, route isolation, countdown expiry, keyboard dialog, overflow and reduced motion.

## Evidence

- Lint, format:check, typecheck, 7/7 unit tests, build and git diff --check pass.
- Built-output Chromium tests pass at 375, 390, 768 and 1440 pixels.
- Envelope/focus, native photo dialog, both RSVP sides and attendance choices,
  mock status, independent gift cards, image download and music demo checked.
- Zero API calls and zero browser console/page errors in final run.
- Root page, trailing-slash route, skip and reduced motion checked.
- Original artwork and local OFL fonts used; no runtime dependencies added.
- Independent review found no blocking issues; replay focus regression was
  reproduced then fixed and verified by the browser suite.
- Real iPhone/Android and Vercel-hosted execution remain unverified.
