import { createApp } from 'vue'
import App from './app/App.vue'
import { isDesignPreview } from './utils/preview'
import './styles/main.css'

if (/^\/thiep-2\/?$/.test(window.location.pathname)) {
  void import('./pages/SecondInvitation.vue').then(({ default: Second }) =>
    createApp(Second).mount('#app'),
  )
} else if (/^\/thiep-3\/?$/.test(window.location.pathname)) {
  void import('./pages/ThirdInvitation.vue').then(({ default: Third }) =>
    createApp(Third).mount('#app'),
  )
} else if (isDesignPreview(window.location.pathname)) {
  void import('./pages/DesignPreview.vue').then(({ default: Preview }) =>
    createApp(Preview).mount('#app'),
  )
} else {
  createApp(App).mount('#app')
}
