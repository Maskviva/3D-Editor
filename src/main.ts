import {createApp} from 'vue'
import './style.css'
import 'element-plus/dist/index.css'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
