export type ThemeId = 'original' | 'sage' | 'peach'

export interface ThemeColors {
  id: ThemeId
  name: string
  icon: string
  primary: string
  primaryText: string
  accent: string
  cardBg: string
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
  original: {
    id: 'original',
    name: 'Gốc',
    icon: '🌿',
    primary: '#424f33',
    primaryText: '#ffffff',
    accent: '#1c491f',
    cardBg: '#424f33',
    canvasBg: '#f7f7f7',
    outerBg: '#303b2b',
    badgeBorder: '#ef9d9b',
    badgeColor: '#ffffff',
    countdownBg: '#424f33',
    assetFilter: 'none',
    opening: {
      backdropGradient:
        'linear-gradient(to bottom right, #364131, #2c3528, #22291f)',
      textColor: '#5d6a57',
      buttonBg: '#5d6a57',
      buttonShadowRgb: '93, 106, 87',
      guestBadgeBg: 'rgba(93, 106, 87, 0.1)',
      cardGlowRgb: '105, 122, 98',
      dividerColor: '#697a62',
      flowerFilter: 'none',
    },
    timeline: {
      bg: '#fafbf7',
      color: '#465640',
      accent: '#819474',
      line: '#bfc9b8',
      dotBg: '#fafbf7',
      cardBg: '#ffffff',
      cardBorder: '#e1e7dc',
      timeColor: '#607554',
      iconColor: '#607554',
    },
  },
  sage: {
    id: 'sage',
    name: 'Xanh Sage',
    icon: '🍃',
    primary: '#557352',
    primaryText: '#ffffff',
    accent: '#364e34',
    cardBg: '#557352',
    canvasBg: '#fdfbf7',
    outerBg: '#edf2eb',
    badgeBorder: '#ffffff',
    badgeColor: '#ffffff',
    countdownBg: '#557352',
    assetFilter: 'hue-rotate(20deg) saturate(0.95) brightness(1.08)',
    opening: {
      backdropGradient:
        'linear-gradient(to bottom right, #344832, #283726, #1d2a1c)',
      textColor: '#557352',
      buttonBg: '#557352',
      buttonShadowRgb: '85, 115, 82',
      guestBadgeBg: 'rgba(85, 115, 82, 0.12)',
      cardGlowRgb: '85, 115, 82',
      dividerColor: '#557352',
      flowerFilter: 'hue-rotate(20deg) saturate(0.95) brightness(1.08)',
    },
    timeline: {
      bg: '#fdfbf7',
      color: '#2b3828',
      accent: '#557352',
      line: '#d1dccd',
      dotBg: '#c5a869',
      cardBg: '#ffffff',
      cardBorder: '#e2ebe0',
      timeColor: '#557352',
      iconColor: '#557352',
    },
  },
  peach: {
    id: 'peach',
    name: 'Hồng Đào',
    icon: '🌸',
    primary: '#ad5560',
    primaryText: '#ffffff',
    accent: '#73323a',
    cardBg: '#ad5560',
    canvasBg: '#fffdfc',
    outerBg: '#fbf0ed',
    badgeBorder: '#ffffff',
    badgeColor: '#ffffff',
    countdownBg: '#ad5560',
    assetFilter: 'hue-rotate(240deg) saturate(1.15) brightness(1.08)',
    opening: {
      backdropGradient:
        'linear-gradient(to bottom right, #5c2f37, #452128, #2e141a)',
      textColor: '#ad5560',
      buttonBg: '#ad5560',
      buttonShadowRgb: '173, 85, 96',
      guestBadgeBg: 'rgba(173, 85, 96, 0.12)',
      cardGlowRgb: '173, 85, 96',
      dividerColor: '#ad5560',
      flowerFilter: 'hue-rotate(240deg) saturate(1.15) brightness(1.08)',
    },
    timeline: {
      bg: '#fffdfc',
      color: '#4a3537',
      accent: '#ad5560',
      line: '#f2d9d6',
      dotBg: '#e09389',
      cardBg: '#ffffff',
      cardBorder: '#f8e5e3',
      timeColor: '#ad5560',
      iconColor: '#ad5560',
    },
  },
}
