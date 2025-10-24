import { createRouter, createWebHistory } from 'vue-router'

// 定义路由
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../App.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue')
    },
    // 404路由
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue')
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 可以在这里添加认证逻辑
    console.log(`从 ${from.path} 跳转到 ${to.path}`)
    next()
})

// 路由错误处理
router.onError((error) => {
    console.error('路由错误:', error)
})

export default router