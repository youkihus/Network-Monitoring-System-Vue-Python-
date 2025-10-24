<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应用设置</span>
        </div>
      </template>
      
      <el-form :model="settingsForm" label-width="120px" size="default">
        <!-- 刷新设置 -->
        <el-form-item label="刷新间隔">
          <el-select v-model="settingsForm.refreshInterval" placeholder="选择刷新间隔">
            <el-option label="1秒" :value="1000" />
            <el-option label="5秒" :value="5000" />
            <el-option label="10秒" :value="10000" />
            <el-option label="30秒" :value="30000" />
            <el-option label="1分钟" :value="60000" />
          </el-select>
        </el-form-item>
        
        <!-- 主题设置 -->
        <el-form-item label="主题">
          <el-radio-group v-model="settingsForm.theme">
            <el-radio label="light">浅色主题</el-radio>
            <el-radio label="dark">深色主题</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 通知设置 -->
        <el-form-item label="通知设置">
          <el-checkbox v-model="settingsForm.notifications.enabled">启用通知</el-checkbox>
          
          <div v-if="settingsForm.notifications.enabled" class="notification-options">
            <el-form-item label="上传阈值" prop="uploadThreshold" :label-width="80">
              <el-input-number
                v-model="settingsForm.notifications.uploadThreshold"
                :min="1"
                :max="100"
                label="上传阈值 (MB/s)"
                :precision="1"
              />
              <span class="unit">MB/s</span>
            </el-form-item>
            
            <el-form-item label="下载阈值" prop="downloadThreshold" :label-width="80">
              <el-input-number
                v-model="settingsForm.notifications.downloadThreshold"
                :min="1"
                :max="200"
                label="下载阈值 (MB/s)"
                :precision="1"
              />
              <span class="unit">MB/s</span>
            </el-form-item>
            
            <el-form-item prop="disconnectAlert" :label-width="80">
              <el-checkbox v-model="settingsForm.notifications.disconnectAlert">断开连接提醒</el-checkbox>
            </el-form-item>
          </div>
        </el-form-item>
        
        <!-- 历史数据保留 -->
        <el-form-item label="历史数据保留">
          <el-input-number
            v-model="settingsForm.historyRetention"
            :min="1"
            :max="72"
            label="保留时间 (小时)"
          />
          <span class="unit">小时</span>
        </el-form-item>
        
        <!-- 语言设置 -->
        <el-form-item label="语言">
          <el-select v-model="settingsForm.language" placeholder="选择语言">
            <el-option label="简体中文" :value="'zh-CN'" />
            <el-option label="English" :value="'en-US'" />
          </el-select>
        </el-form-item>
        
        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置</el-button>
          <el-button type="danger" @click="restoreDefaults">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import store from '../store'
import { ElMessage } from 'element-plus'

export default {
  name: 'Settings',
  setup() {
    // 表单数据
    const settingsForm = reactive({
      refreshInterval: 5000,
      theme: 'light',
      notifications: {
        enabled: true,
        uploadThreshold: 10,
        downloadThreshold: 50,
        disconnectAlert: true
      },
      historyRetention: 24,
      language: 'zh-CN'
    })
    
    // 从store加载设置
    const loadSettings = () => {
      const savedSettings = store.getters.getSettings()
      Object.assign(settingsForm, savedSettings)
    }
    
    // 保存设置
    const saveSettings = async () => {
      try {
        await store.actions.saveSettings(settingsForm)
        ElMessage.success('设置保存成功！')
      } catch (error) {
        ElMessage.error('保存失败：' + error.message)
      }
    }
    
    // 重置表单
    const resetSettings = () => {
      loadSettings()
      ElMessage.info('已重置为当前设置')
    }
    
    // 恢复默认设置
    const restoreDefaults = () => {
      if (confirm('确定要恢复默认设置吗？所有自定义设置将会丢失。')) {
        store.mutations.resetToDefaults()
        loadSettings()
        ElMessage.success('已恢复默认设置')
      }
    }
    
    // 生命周期钩子
    onMounted(() => {
      loadSettings()
    })
    
    return {
      settingsForm,
      saveSettings,
      resetSettings,
      restoreDefaults
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.notification-options {
  margin-top: 10px;
  margin-left: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.unit {
  margin-left: 8px;
  color: #666;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>