import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 创建Vue应用实例
const app = createApp(App)

// 配置axios
axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:5000/api'
axios.defaults.timeout = 10000

// 添加请求拦截器
axios.interceptors.request.use(
    config => {
        // 可以在这里添加token等认证信息
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 添加响应拦截器
axios.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        // 处理网络错误
        console.error('网络请求错误:', error)
        return Promise.reject(error)
    }
)

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(store)

// 全局注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 全局属性\app.config.globalProperties.$axios = axios

// 挂载应用
app.mount('#app')