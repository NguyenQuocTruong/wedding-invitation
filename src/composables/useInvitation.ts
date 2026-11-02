import { inject, type InjectionKey } from 'vue'
import type { PreviewEvent } from '../config/preview'

export interface InvitationContext {
  event: PreviewEvent
  preview: boolean
}
export const invitationKey: InjectionKey<InvitationContext> =
  Symbol('invitation')
export function useInvitation(): InvitationContext {
  const context = inject(invitationKey)
  if (!context) throw new Error('Invitation context is required')
  return context
}
