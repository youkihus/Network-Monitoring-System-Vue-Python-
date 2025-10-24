<template>
  <div class="about-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关于项目</span>
        </div>
      </template>
      
      <div class="about-content">
        <div class="project-info">
          <img src="/logo.png" alt="项目Logo" class="project-logo">
          <h2>网络状态监控系统</h2>
          <p class="version">版本 1.0.0</p>
          <p class="description">
            这是一个使用Vue.js前端和Python后端开发的网络状态监控工具，可以实时监控电脑的网络连接状态、
            上传下载速度等信息，并通过直观的图表展示历史数据。
          </p>
        </div>
        
        <div class="features">
          <h3>主要功能</h3>
          <ul>
            <li><el-icon><check /></el-icon> 实时监控网络连接状态</li>
            <li><el-icon><check /></el-icon> 显示上传下载速度和总流量</li>
            <li><el-icon><check /></el-icon> 展示网络接口详细信息</li>
            <li><el-icon><check /></el-icon> 历史数据图表展示</li>
            <li><el-icon><check /></el-icon> 支持自动刷新和手动刷新</li>
            <li><el-icon><check /></el-icon> 响应式设计，适配不同设备</li>
          </ul>
        </div>
        
        <div class="tech-stack">
          <h3>技术栈</h3>
          <div class="tech-items">
            <div class="tech-item">
              <div class="tech-name">前端</div>
              <ul>
                <li>Vue.js 3</li>
                <li>Element Plus</li>
                <li>Axios</li>
                <li>Chart.js</li>
              </ul>
            </div>
            <div class="tech-item">
              <div class="tech-name">后端</div>
              <ul>
                <li>Python</li>
                <li>Flask</li>
                <li>psutil</li>
                <li>Flask-CORS</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="author-info">
          <h3>作者信息</h3>
          <p>开发团队：网络监控开发组</p>
          <p>联系邮箱：support@network-monitor.com</p>
          <p>开发日期：2024年</p>
        </div>
        
        <div class="license">
          <h3>许可证</h3>
          <p>本项目采用 MIT 许可证开源</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Check } from '@element-plus/icons-vue'

export default {
  name: 'About',
  components: {
    Check
  }
}
</script>

<style scoped>
.about-container {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.project-info {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.project-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  border-radius: 50%;
  background-color: #1890ff;
}

.project-info h2 {
  margin: 10px 0;
  color: #1890ff;
}

.version {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.description {
  line-height: 1.6;
  color: #333;
  max-width: 700px;
  margin: 0 auto;
}

.features h3,
.tech-stack h3,
.author-info h3,
.license h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eaeaea;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.features el-icon {
  color: #52c41a;
  margin-right: 10px;
}

.tech-stack {
  margin-top: 20px;
}

.tech-items {
  display: flex;
  gap: 30px;
}

.tech-item {
  flex: 1;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.tech-name {
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  text-align: center;
}

.tech-item ul {
  list-style: none;
  padding: 0;
}

.tech-item li {
  padding: 5px 0;
  color: #666;
}

.author-info,
.license {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.author-info p,
.license p {
  margin-bottom: 10px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-items {
    flex-direction: column;
  }
  
  .project-logo {
    width: 80px;
    height: 80px;
  }
}
</style>