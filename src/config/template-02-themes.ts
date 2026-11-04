export type ThemeId = 'sage'

export interface ThemeColors {
  id: ThemeId
  name: string
  icon: string
  primary: string
  primaryText: string
  accent: string
  cardBg: string
  archBg: string
  canvasBg: string
  outerBg: string
  badgeBorder: string
  badgeColor: string
  countdownBg: string
  assetFilter: string
  opening: {
    backdropGradient: string
    textColor: string
    buttonBg: string
    buttonShadowRgb: string
    guestBadgeBg: string
    cardGlowRgb: string
    dividerColor: string
    flowerFilter: string
  }
  timeline: {
    bg: string
    color: string
    accent: string
    line: string
    dotBg: string
    cardBg: string
    cardBorder: string
    timeColor: string
    iconColor: string
  }
}

export const TEMPLATE_02_THEMES: Record<ThemeId, ThemeColors> = {
  sage: {
    id: 'sage',
    name: 'Xanh Sage',
    icon: '🍃',
    primary: '#4a7c59',
    primaryText: '#ffffff',
    accent: '#2f5d3e',
    cardBg: '#4a7c59',
    archBg: '#eaf2e8',
    canvasBg: '#fdfbf7',
    outerBg: '#edf2eb',
    badgeBorder: '#ffffff',
    badgeColor: '#ffffff',
    countdownBg: '#4a7c59',
    assetFilter: 'hue-rotate(28deg) saturate(1.15) brightness(1.22)',
    opening: {
      backdropGradient:
        'linear-gradient(to bottom right, #5b8a68, #436e50, #2f523a)',
      textColor: '#3d6b4b',
      buttonBg: '#4a7c59',
      buttonShadowRgb: '74, 124, 89',
      guestBadgeBg: 'rgba(74, 124, 89, 0.12)',
      cardGlowRgb: '74, 124, 89',
      dividerColor: '#4a7c59',
      flowerFilter: 'hue-rotate(28deg) saturate(1.15) brightness(1.18)',
    },
    timeline: {
      bg: '#fdfbf7',
      color: '#2b3828',
      accent: '#4a7c59',
      line: '#c8dccd',
      dotBg: '#ffffff',
      cardBg: '#ffffff',
      cardBorder: '#dcebe0',
      timeColor: '#3d6b4b',
      iconColor: '#4a7c59',
    },
  },
}
