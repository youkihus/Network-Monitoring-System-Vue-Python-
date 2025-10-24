<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <el-icon><network /></el-icon>
        <span class="header-title">网络状态监控系统</span>
      </div>
      <div class="header-right">
        <el-button @click="refreshData" type="primary" size="small" icon="Refresh">
          刷新数据
        </el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text="手动刷新"
          size="small"
          @change="handleAutoRefreshChange"
        />
      </div>
    </el-header>

    <!-- 主内容区域 -->
    <el-main class="main-content">
      <!-- 网络状态概览 -->
      <el-card class="status-card">
        <template #header>
          <div class="card-header">
            <span>网络状态概览</span>
            <div class="connection-status" :class="connectionStatusClass">
              <el-icon :class="connectionStatusIcon"><status-point /></el-icon>
              <span>{{ connectionStatusText }}</span>
            </div>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-statistic
              :value="networkStatus.public_ip || '未知'"
              label="公网IP地址"
              :precision="0"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-statistic
              :value="formatBytes(networkStatus.network_speed?.total_upload || 0)"
              label="总上传流量"
              value-style="color: #3f8600"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-statistic
              :value="formatBytes(networkStatus.network_speed?.total_download || 0)"
              label="总下载流量"
              value-style="color: #cf1322"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-statistic
              :value="lastUpdatedTime"
              label="最后更新时间"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- 网络速度监控 -->
      <el-card class="speed-card">
        <template #header>
          <div class="card-header">
            <span>网络速度实时监控</span>
            <el-select v-model="refreshInterval" placeholder="刷新间隔" size="small" @change="handleRefreshIntervalChange">
              <el-option label="1秒" :value="1000" />
              <el-option label="5秒" :value="5000" />
              <el-option label="10秒" :value="10000" />
              <el-option label="30秒" :value="30000" />
            </el-select>
          </div>
        </template>

        <div class="speed-container">
          <div class="speed-item">
            <div class="speed-label">上传速度</div>
            <div class="speed-value upload-speed">
              {{ formatBytesPerSecond(networkStatus.network_speed?.upload_speed || 0) }}
            </div>
            <el-progress
              :percentage="calculateSpeedPercentage(networkStatus.network_speed?.upload_speed || 0, 'upload')"
              :status="getSpeedStatus(networkStatus.network_speed?.upload_speed || 0, 'upload')"
              :stroke-width="8"
              :text-inside="true"
              class="speed-progress"
            />
          </div>

          <div class="speed-item">
            <div class="speed-label">下载速度</div>
            <div class="speed-value download-speed">
              {{ formatBytesPerSecond(networkStatus.network_speed?.download_speed || 0) }}
            </div>
            <el-progress
              :percentage="calculateSpeedPercentage(networkStatus.network_speed?.download_speed || 0, 'download')"
              :status="getSpeedStatus(networkStatus.network_speed?.download_speed || 0, 'download')"
              :stroke-width="8"
              :text-inside="true"
              class="speed-progress"
            />
          </div>
        </div>
      </el-card>

      <!-- 数据展示选项卡 -->
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 网络接口信息 -->
        <el-tab-pane label="网络接口信息" name="interfaces">
          <el-table :data="networkInterfaces" style="width: 100%">
            <el-table-column prop="name" label="接口名称" width="180" />
            <el-table-column prop="is_up" label="连接状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_up ? 'success' : 'danger'">
                  {{ row.is_up ? '已连接' : '未连接' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="speed" label="接口速度" width="120">
              <template #default="{ row }">
                {{ row.speed > 0 ? (row.speed / 1000 / 1000).toFixed(2) + ' Gbps' : '未知' }}
              </template>
            </el-table-column>
            <el-table-column prop="ip_addresses" label="IP地址">
              <template #default="{ row }">
                <div v-for="ip in row.ip_addresses" :key="ip.address">
                  <span class="ip-type">{{ ip.type }}:</span> {{ ip.address }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sent_bytes" label="上传字节" width="180">
              <template #default="{ row }">
                {{ formatBytes(row.sent_bytes) }}
              </template>
            </el-table-column>
            <el-table-column prop="received_bytes" label="下载字节" width="180">
              <template #default="{ row }">
                {{ formatBytes(row.received_bytes) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 网络历史数据 -->
        <el-tab-pane label="网络历史数据" name="history">
          <div class="history-controls">
            <el-select v-model="historyTimeRange" placeholder="时间范围" size="small">
              <el-option label="30分钟" :value="30" />
              <el-option label="1小时" :value="60" />
              <el-option label="3小时" :value="180" />
              <el-option label="6小时" :value="360" />
            </el-select>
            <el-button @click="fetchHistoryData" type="primary" size="small" style="margin-left: 10px;">
              更新图表
            </el-button>
          </div>
          <div class="chart-container">
            <canvas ref="speedChart"></canvas>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <!-- 底部信息 -->
    <el-footer class="footer">
      <p>网络状态监控系统 &copy; {{ currentYear }} 版权所有</p>
    </el-footer>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Network, Refresh, StatusPoint } from '@element-plus/icons-vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

export default {
  name: 'App',
  components: {
    Network,
    Refresh,
    StatusPoint
  },
  setup() {
    // 响应式数据
    const networkStatus = reactive({
      internet_connected: false,
      public_ip: '',
      network_speed: {
        upload_speed: 0,
        download_speed: 0,
        total_upload: 0,
        total_download: 0
      },
      timestamp: ''
    })
    
    const networkInterfaces = ref([])
    const networkHistory = ref([])
    const lastUpdatedTime = ref('')
    const autoRefresh = ref(true)
    const refreshInterval = ref(5000)
    const activeTab = ref('interfaces')
    const historyTimeRange = ref(60) // 默认1小时
    
    // Chart实例
    let speedChart = null
    let refreshTimer = null
    
    // 初始化图表
    const initChart = () => {
      nextTick(() => {
        const ctx = document.querySelector('canvas').getContext('2d')
        
        // 如果已有图表实例，销毁它
        if (speedChart) {
          speedChart.destroy()
        }
        
        speedChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: '上传速度 (KB/s)',
                data: [],
                borderColor: 'rgba(63, 134, 0, 1)',
                backgroundColor: 'rgba(63, 134, 0, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false
              },
              {
                label: '下载速度 (KB/s)',
                data: [],
                borderColor: 'rgba(207, 19, 34, 1)',
                backgroundColor: 'rgba(207, 19, 34, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: '时间'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: '速度 (KB/s)'
                },
                beginAtZero: true
              }
            }
          }
        })
      })
    }
    
    // 更新图表数据
    const updateChart = () => {
      if (!speedChart || !networkHistory.value.length) return
      
      const labels = networkHistory.value.map(item => {
        const date = new Date(item.timestamp)
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
      })
      
      const uploadData = networkHistory.value.map(item => (item.upload_speed / 1024).toFixed(2))
      const downloadData = networkHistory.value.map(item => (item.download_speed / 1024).toFixed(2))
      
      speedChart.data.labels = labels
      speedChart.data.datasets[0].data = uploadData
      speedChart.data.datasets[1].data = downloadData
      speedChart.update()
    }
    
    // 获取网络状态
    const fetchNetworkStatus = async () => {
      try {
        const response = await axios.get('/network/status')
        if (response.status === 'success') {
          Object.assign(networkStatus, response)
          lastUpdatedTime.value = new Date().toLocaleString('zh-CN')
        }
      } catch (error) {
        console.error('获取网络状态失败:', error)
      }
    }
    
    // 获取网络接口信息
    const fetchNetworkInterfaces = async () => {
      try {
        const response = await axios.get('/network/interfaces')
        if (response.status === 'success') {
          networkInterfaces.value = response.interfaces
        }
      } catch (error) {
        console.error('获取网络接口信息失败:', error)
      }
    }
    
    // 获取历史数据
    const fetchHistoryData = async () => {
      try {
        const hours = historyTimeRange.value / 60
        const response = await axios.get(`/network/history?hours=${hours}`)
        if (response.status === 'success') {
          networkHistory.value = response.history
          updateChart()
        }
      } catch (error) {
        console.error('获取历史数据失败:', error)
      }
    }
    
    // 刷新数据
    const refreshData = async () => {
      await Promise.all([
        fetchNetworkStatus(),
        fetchNetworkInterfaces()
      ])
      
      // 如果当前在历史数据标签页，也刷新历史数据
      if (activeTab.value === 'history') {
        await fetchHistoryData()
      }
    }
    
    // 设置自动刷新
    const setupAutoRefresh = () => {
      // 清除之前的定时器
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
      
      // 设置新的定时器
      if (autoRefresh.value) {
        refreshTimer = setInterval(refreshData, refreshInterval.value)
      }
    }
    
    // 处理自动刷新开关变化
    const handleAutoRefreshChange = () => {
      setupAutoRefresh()
    }
    
    // 处理刷新间隔变化
    const handleRefreshIntervalChange = () => {
      setupAutoRefresh()
    }
    
    // 格式化字节数
    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }
    
    // 格式化每秒字节数
    const formatBytesPerSecond = (bytesPerSecond, decimals = 2) => {
      return formatBytes(bytesPerSecond, decimals) + '/s'
    }
    
    // 计算速度百分比（用于进度条显示）
    const calculateSpeedPercentage = (speed, type) => {
      // 这里假设最大速度为100MB/s，可以根据实际情况调整
      const maxSpeed = 100 * 1024 * 1024
      const percentage = Math.min((speed / maxSpeed) * 100, 100)
      return percentage
    }
    
    // 获取速度状态（用于进度条颜色）
    const getSpeedStatus = (speed, type) => {
      // 这里根据速度值返回不同的状态
      const mbSpeed = speed / 1024 / 1024
      
      if (mbSpeed < 1) return 'success'
      if (mbSpeed < 10) return 'warning'
      return 'danger'
    }
    
    // 生命周期钩子
    onMounted(() => {
      // 初始化数据
      refreshData()
      
      // 设置自动刷新
      setupAutoRefresh()
      
      // 初始化图表
      initChart()
    })
    
    onUnmounted(() => {
      // 清除定时器
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
      
      // 销毁图表
      if (speedChart) {
        speedChart.destroy()
      }
    })
    
    return {
      networkStatus,
      networkInterfaces,
      networkHistory,
      lastUpdatedTime,
      autoRefresh,
      refreshInterval,
      activeTab,
      historyTimeRange,
      refreshData,
      fetchHistoryData,
      handleAutoRefreshChange,
      handleRefreshIntervalChange,
      formatBytes,
      formatBytesPerSecond,
      calculateSpeedPercentage,
      getSpeedStatus,
      currentYear: new Date().getFullYear(),
      connectionStatusClass: computed(() => networkStatus.internet_connected ? 'connected' : 'disconnected'),
      connectionStatusIcon: computed(() => networkStatus.internet_connected ? 'icon-success' : 'icon-danger'),
      connectionStatusText: computed(() => networkStatus.internet_connected ? '已连接互联网' : '未连接互联网')
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #1890ff;
  color: white;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 20px;
  margin-left: 10px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 主内容样式 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 卡片样式 */
.status-card,
.speed-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 连接状态样式 */
.connection-status {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.connection-status.connected {
  color: #52c41a;
}

.connection-status.disconnected {
  color: #ff4d4f;
}

.icon-success {
  color: #52c41a;
}

.icon-danger {
  color: #ff4d4f;
}

/* 网络速度样式 */
.speed-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.speed-item {
  flex: 1;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
}

.speed-label {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #666;
}

.speed-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.upload-speed {
  color: #3f8600;
}

.download-speed {
  color: #cf1322;
}

.speed-progress {
  height: 30px;
}

/* IP地址样式 */
.ip-type {
  font-weight: 500;
  color: #666;
  margin-right: 5px;
}

/* 历史数据样式 */
.history-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

/* 底部样式 */
.footer {
  background-color: #f0f2f5;
  text-align: center;
  padding: 10px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .speed-container {
    flex-direction: column;
  }
  
  .header {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .header-left,
  .header-right {
    margin-bottom: 10px;
  }
}
</style>