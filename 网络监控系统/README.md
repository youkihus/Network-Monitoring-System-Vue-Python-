# 网络状态监控项目

这是一个使用Vue前端和Python后端开发的网络状态监控工具，可以实时监控电脑的网络连接状态、上传下载速度等信息。

## 项目结构

```
vue+python项目/
├── backend/         # Python后端代码
│   ├── app.py       # 主应用文件
│   ├── requirements.txt  # Python依赖
├── frontend/        # Vue前端代码
│   ├── index.html   # 入口HTML
│   ├── src/         # 源代码
│   └── ...
└── README.md        # 项目说明
```

## 功能特性

- 实时监控网络连接状态
- 显示上传下载速度
- 显示网络接口信息
- 历史数据图表展示
- 响应式设计，适配不同设备

## 安装和运行

### 后端

1. 进入backend目录
2. 安装依赖：pip install -r requirements.txt
3. 运行应用：python app.py

### 前端

1. 进入frontend目录
2. 安装依赖：npm install
3. 运行开发服务器：npm run serve

## 技术栈

- 前端：Vue.js, Axios, Chart.js
- 后端：Python, Flask, psutil

## 注意事项

- 确保安装了Python和Node.js环境
- 运行时可能需要管理员权限以获取完整的网络信息