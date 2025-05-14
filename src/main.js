import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

const toastOptions = {
  position: "top-right",
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
}

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

document.title = import.meta.env.VITE_APP_TITLE || 'App';

app.mount('#app')
