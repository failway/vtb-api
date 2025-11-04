import '@/app/config/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/app/config/router'
import {useAuthStore} from "@/store/AuthStore.ts";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
