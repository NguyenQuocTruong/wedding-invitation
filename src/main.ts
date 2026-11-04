import { createApp } from 'vue'
import { isDesignPreview } from './utils/preview'
import './styles/main.css'

if (/^\/thiep-3\/?$/.test(window.location.pathname)) {
  void import('./pages/ThirdInvitation.vue').then(({ default: Third }) =>
    createApp(Third).mount('#app'),
  )
} else if (isDesignPreview(window.location.pathname)) {
  void import('./pages/DesignPreview.vue').then(({ default: Preview }) =>
    createApp(Preview).mount('#app'),
  )
} else {
  // Thay the hoan toan thiep 1: / va /thiep-2 mac dinh hien thi thiep 2 (Hoa Moc Xanh)
  void import('./pages/SecondInvitation.vue').then(({ default: Second }) =>
    createApp(Second).mount('#app'),
  )
}
