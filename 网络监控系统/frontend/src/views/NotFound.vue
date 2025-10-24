<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="status-code">404</div>
      <h2>页面未找到</h2>
      <p>您访问的页面不存在或已被移除</p>
      <div class="actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    
    const goHome = () => {
      router.push('/')
    }
    
    const goBack = () => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        router.push('/')
      }
    }
    
    return {
      goHome,
      goBack
    }
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
  background-color: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.status-code {
  font-size: 100px;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 20px;
  line-height: 1;
}

.not-found-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.not-found-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-code {
    font-size: 80px;
  }
  
  .not-found-content {
    margin: 20px;
    padding: 40px 20px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>