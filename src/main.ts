import { createApp } from 'vue'
import App from './app/App.vue'
import { isDesignPreview } from './utils/preview'
import './styles/main.css'

if (isDesignPreview(window.location.pathname)) {
  void import('./pages/DesignPreview.vue').then(({ default: Preview }) =>
    createApp(Preview).mount('#app'),
  )
} else {
  createApp(App).mount('#app')
}
