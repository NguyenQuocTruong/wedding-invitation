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
    badgeBorder: '#c5a869',
    badgeColor: '#c5a869',
    countdownBg: '#557352',
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
    primary: '#c46d75',
    primaryText: '#ffffff',
    accent: '#73323a',
    cardBg: '#c46d75',
    canvasBg: '#fffdfc',
    outerBg: '#fbf0ed',
    badgeBorder: '#e09389',
    badgeColor: '#e09389',
    countdownBg: '#c46d75',
    timeline: {
      bg: '#fffdfc',
      color: '#4a3537',
      accent: '#c46d75',
      line: '#f2d9d6',
      dotBg: '#e09389',
      cardBg: '#ffffff',
      cardBorder: '#f8e5e3',
      timeColor: '#c46d75',
      iconColor: '#c46d75',
    },
  },
}
