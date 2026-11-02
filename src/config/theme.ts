export const theme = {
  colors: { background: '#ffffff', text: '#1f2937' },
  fontFamily: 'system-ui, sans-serif',
  effects: { enabled: false, intensity: 0 },
}

// Preview-only tokens; production theme above stays unchanged.
export const previewTheme = {
  '--paper': '#faf9f6',
  '--ink': '#303733',
  '--muted': '#626760',
  '--sage': '#e6ede6',
  '--line': '#dedcd5',
  '--font-body': 'PreviewVietnam, system-ui, sans-serif',
  '--font-heading': 'PreviewLora, Georgia, serif',
  '--reveal-duration': '650ms',
}

export const previewMotion = { enabled: true, openingMs: 850, revealMs: 650 }
