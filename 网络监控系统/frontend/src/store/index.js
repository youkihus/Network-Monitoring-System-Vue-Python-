import { reactive, readonly } from 'vue'

// 定义状态
const state = reactive({
    // 应用设置
    settings: {
        refreshInterval: 5000, // 默认刷新间隔5秒
        theme: 'light', // 主题：light或dark
        notifications: {
            enabled: true,
            uploadThreshold: 10 * 1024 * 1024, // 10MB/s
            downloadThreshold: 50 * 1024 * 1024, // 50MB/s
            disconnectAlert: true
        },
        historyRetention: 24, // 历史数据保留小时数
        language: 'zh-CN' // 语言
    },

    // 应用状态
    appStatus: {
        isLoading: false,
        error: null,
        lastUpdate: null
    },

    // 用户偏好
    preferences: {
        showSpeedGauge: true,
        showNetworkInterfaces: true,
        showHistoryChart: true,
        autoRefresh: true
    }
})

// 定义getter函数
const getters = {
    // 获取全部状态（只读）
    getState: () => readonly(state),

    // 获取设置
    getSettings: () => readonly(state.settings),

    // 获取应用状态
    getAppStatus: () => readonly(state.appStatus),

    // 获取用户偏好
    getPreferences: () => readonly(state.preferences),

    // 获取特定设置项
    getSetting: (key) => {
        // 支持嵌套键，如 'notifications.enabled'
        if (key.includes('.')) {
            const [parent, child] = key.split('.')
            return state.settings[parent]?.[child]
        }
        return state.settings[key]
    }
}

// 定义mutations
const mutations = {
    // 更新设置
    updateSettings(newSettings) {
        Object.assign(state.settings, newSettings)
        // 保存到localStorage
        localStorage.setItem('appSettings', JSON.stringify(state.settings))
    },

    // 更新特定设置项
    updateSetting(key, value) {
        if (key.includes('.')) {
            const [parent, child] = key.split('.')
            if (state.settings[parent]) {
                state.settings[parent][child] = value
            }
        } else {
            state.settings[key] = value
        }
        // 保存到localStorage
        localStorage.setItem('appSettings', JSON.stringify(state.settings))
    },

    // 更新应用状态
    updateAppStatus(newStatus) {
        Object.assign(state.appStatus, newStatus)
    },

    // 更新用户偏好
    updatePreferences(newPreferences) {
        Object.assign(state.preferences, newPreferences)
        // 保存到localStorage
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences))
    },

    // 设置加载状态
    setLoading(isLoading) {
        state.appStatus.isLoading = isLoading
    },

    // 设置错误信息
    setError(error) {
        state.appStatus.error = error
    },

    // 清除错误信息
    clearError() {
        state.appStatus.error = null
    },

    // 设置最后更新时间
    setLastUpdate(time) {
        state.appStatus.lastUpdate = time
    },

    // 从localStorage加载设置
    loadFromStorage() {
        try {
            // 加载设置
            const savedSettings = localStorage.getItem('appSettings')
            if (savedSettings) {
                Object.assign(state.settings, JSON.parse(savedSettings))
            }

            // 加载用户偏好
            const savedPreferences = localStorage.getItem('userPreferences')
            if (savedPreferences) {
                Object.assign(state.preferences, JSON.parse(savedPreferences))
            }
        } catch (error) {
            console.error('从localStorage加载数据失败:', error)
        }
    },

    // 重置为默认设置
    resetToDefaults() {
        // 重置设置
        state.settings = {
            refreshInterval: 5000,
            theme: 'light',
            notifications: {
                enabled: true,
                uploadThreshold: 10 * 1024 * 1024,
                downloadThreshold: 50 * 1024 * 1024,
                disconnectAlert: true
            },
            historyRetention: 24,
            language: 'zh-CN'
        }

        // 重置用户偏好
        state.preferences = {
            showSpeedGauge: true,
            showNetworkInterfaces: true,
            showHistoryChart: true,
            autoRefresh: true
        }

        // 清除localStorage
        localStorage.removeItem('appSettings')
        localStorage.removeItem('userPreferences')
    }
}

// 定义actions
const actions = {
    // 异步保存设置
    async saveSettings(newSettings) {
        // 可以在这里添加API调用，保存到服务器
        mutations.updateSettings(newSettings)
        return { success: true }
    },

    // 异步加载设置
    async loadSettings() {
        mutations.loadFromStorage()
        return { success: true }
    },

    // 初始化应用状态
    async initApp() {
        mutations.setLoading(true)
        try {
            await actions.loadSettings()
            mutations.setLastUpdate(new Date().toISOString())
            return { success: true }
        } catch (error) {
            mutations.setError(error.message)
            return { success: false, error: error.message }
        } finally {
            mutations.setLoading(false)
        }
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}