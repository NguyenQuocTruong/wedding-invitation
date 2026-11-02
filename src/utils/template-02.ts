import type { CSSProperties } from 'vue'
import assetManifest from '../data/template-02-assets.json'
const assets: Record<string, string> = assetManifest
export interface NodeProps {
  top: number
  left: number
  width: number
  height: number
  rotation?: number
  zIndex?: number
  opacity?: number
  text?: string
  fallbackText?: string
  semanticField?: string
  imgKey?: string
  maskShapeImg?: string
  materialType?: string
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  lineHeight?: string | number
  letterSpacing?: string | number
  textTransform?: string
  padding?: number[]
  borderRadius?: number[]
  borderSize?: number
  borderPosition?: string
  borderStyle?: string
  hasShadow?: boolean
  boxShadow?: {
    offsetX: number
    offsetY: number
    blur: number
    spread: number
    color: string
  }
  continuousAnimation?: { type: string; duration: number; delay: number }
  borderColor?: string
  flipX?: boolean
  flipY?: boolean
  transition?: {
    effectType: string
    effectEnabled: boolean
    effectDuration: number
    effectDelay: number
    effectEasing?: string
  }
}
export interface LayoutNode {
  id: string
  type: string
  props: NodeProps
}
export function asset(key = '') {
  return assets[key] || 'https://assets.ngaychungdoi.com/' + key
}
export function nodeStyle(p: NodeProps): CSSProperties {
  return {
    top: p.top + 'px',
    left: p.left + 'px',
    width: p.width + 'px',
    height: p.height + 'px',
    zIndex: p.zIndex || 0,
    opacity: p.opacity ?? 1,
    transform: `rotate(${p.rotation || 0}deg)`,
    borderRadius: p.borderRadius?.map((x) => x + 'px').join(' '),
  }
}
export function elementStyle(p: NodeProps, nodeType?: string): CSSProperties {
  const style: CSSProperties = {
    backgroundColor: p.backgroundColor?.startsWith('#')
      ? p.backgroundColor
      : 'transparent',
    color: p.color,
    fontSize: (p.fontSize || 16) + 'px',
    fontFamily: (p.fontFamily || 'Georgia') + ', serif',
    fontWeight: p.fontWeight,
    fontStyle: p.fontStyle,
    textAlign: p.textAlign as CSSProperties['textAlign'],
    lineHeight: p.lineHeight || 'normal',
    letterSpacing:
      typeof p.letterSpacing === 'number'
        ? p.letterSpacing + 'px'
        : p.letterSpacing,
    textTransform: p.textTransform as CSSProperties['textTransform'],
    padding: p.padding?.map((x) => x + 'px').join(' '),
    borderRadius: p.borderRadius?.map((x) => x + 'px').join(' '),

    '--enter-duration': `${p.transition?.effectDuration || 1}s`,
    '--enter-delay': `${p.transition?.effectDelay || 0}s`,
    '--enter-easing': p.transition?.effectEasing || 'ease-out',
    '--continuous-duration': `${p.continuousAnimation?.duration || 2}s`,
    '--continuous-delay': `${p.continuousAnimation?.delay || 0}s`,
  }
  if (p.borderSize) {
    const value = `${p.borderSize}px ${p.borderStyle || 'solid'} ${p.borderColor || 'transparent'}`
    if (!p.borderPosition || p.borderPosition === 'all') style.border = value
    else
      for (const edge of p.borderPosition.split(/[, ]+/)) {
        if (edge === 'bottom') style.borderBottom = value
        if (edge === 'top') style.borderTop = value
        if (edge === 'left') style.borderLeft = value
        if (edge === 'right') style.borderRight = value
      }
  }
  if (p.hasShadow && p.boxShadow) {
    const b = p.boxShadow
    style.boxShadow = `${b.offsetX}px ${b.offsetY}px ${b.blur}px ${b.spread}px ${b.color}`
  }
  if (p.maskShapeImg) {
    style.maskImage = `url("${asset(p.maskShapeImg)}")`
    style.maskSize = '100% 100%'
  }
  if (p.materialType === 'svg') {
    style.backgroundColor = p.color
    if (!p.imgKey?.includes('5j9b0oqlp77r51ggbqxnzp.svg')) {
      style.maskImage = `url("${asset(p.imgKey)}")`
      style.maskSize = '100% 100%'
    }
  }
  if (nodeType === 'PluginRsvp') {
    style.backgroundColor = 'transparent'
    style.border = 'none'
    style.boxShadow = 'none'
    style.padding = '0'
  }
  return style
}

export function getCanvasScale(width: number) {
  return Math.min(1, Math.max(0, width) / 430)
}
