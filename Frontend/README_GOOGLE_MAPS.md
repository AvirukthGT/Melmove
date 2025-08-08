# Google Maps API Setup for MelMove

## 设置Google Maps API

### 1. 获取API密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下API：
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. 在"凭据"页面创建API密钥

### 2. 配置API密钥

有两种方式配置API密钥：

#### 方式1：直接修改配置文件
编辑 `src/config/maps.js` 文件：
```javascript
export const GOOGLE_MAPS_API_KEY = '你的实际API密钥'
```

#### 方式2：使用环境变量（推荐）
1. 在项目根目录创建 `.env` 文件：
```
VITE_GOOGLE_MAPS_API_KEY=你的实际API密钥
```

2. 修改 `src/config/maps.js` 文件：
```javascript
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'
```

### 3. API密钥安全

- 在生产环境中，建议设置API密钥的HTTP引用站点限制
- 只允许你的域名访问API密钥
- 定期轮换API密钥

### 4. 功能特性

启用Google Maps后，Live页面将具备以下功能：

- ✅ 真实的地图渲染（街道、建筑、地标）
- ✅ 用户位置标记（蓝色圆点）
- ✅ 停车位标记（不同颜色区分类型）
- ✅ 点击标记显示详情
- ✅ 搜索功能（支持地址搜索）
- ✅ 2公里筛选功能
- ✅ 导航到停车位
- ✅ 地图缩放和平移

### 5. 故障排除

如果地图无法加载：
1. 检查API密钥是否正确
2. 确认已启用必要的API
3. 检查网络连接
4. 查看浏览器控制台错误信息

### 6. 费用说明

Google Maps API有免费配额：
- Maps JavaScript API: 每月28,500次加载
- Places API: 每月28,500次请求
- Geocoding API: 每月2,500次请求

超出免费配额后需要付费使用。
