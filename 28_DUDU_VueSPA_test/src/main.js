import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

// 第三方樣式（順序：先 element-plus，再我們的全域樣式以便覆寫變數）
import 'element-plus/dist/index.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '@fortawesome/fontawesome-free/css/all.min.css'

// Bootstrap 行為（collapse / dropdown / modal / carousel 由 data-bs-* 屬性驅動）
import 'bootstrap'

// 全域樣式（由原站 inline CSS 拆出）
import './assets/styles/variables.css'
import './assets/styles/layout.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
