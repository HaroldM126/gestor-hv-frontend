import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import './assets/main.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// ✅ Importante: cargar sesión ANTES de montar router
const auth = useAuthStore()
await auth.hydrateFromStorage()

app.use(router)
app.mount('#app')
