# MelMove Quick Setup Guide

## 🚀 快速开始

### 当前状态
应用现在可以立即运行，无需Google Maps API密钥！

### 功能说明
- ✅ **Demo模式地图**：使用CSS模拟的地图界面
- ✅ **完整功能**：所有停车位功能都正常工作
- ✅ **用户定位**：显示用户当前位置
- ✅ **搜索筛选**：支持搜索和2公里筛选
- ✅ **交互功能**：点击标记、导航等

### 如何启用真实Google Maps

如果你想要使用真实的Google Maps：

1. **获取API密钥**：
   - 访问 https://console.cloud.google.com/
   - 创建新项目
   - 启用：Maps JavaScript API、Places API、Geocoding API
   - 创建API密钥

2. **配置API密钥**：
   - 编辑 `src/config/maps.js`
   - 将 `YOUR_GOOGLE_MAPS_API_KEY` 替换为你的实际密钥

3. **重启应用**：
   ```bash
   npm run dev
   ```

### 当前Demo模式特性
- 🗺️ 模拟墨尔本街道地图
- 🅿️ 停车位标记（可点击）
- 📍 用户位置标记
- 🔍 搜索功能
- 📍 2公里筛选
- 🧭 导航功能
- 📱 响应式设计

### 运行应用
```bash
cd Frontend
npm run dev
```

访问 http://localhost:5173 即可使用！

### 注意事项
- Demo模式完全免费，无需API密钥
- 所有功能都可以正常使用
- 地图是模拟的，但功能完整
- 可以随时添加Google Maps API密钥升级到真实地图
