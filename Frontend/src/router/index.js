// 管理前端页面之间怎么跳转，比如：
// 用户访问 -> 显示首页 （Home.vue）
// 用户访问 Live -> LiveParking.vue
// 用户访问 forecast -> Forecast.vue



// import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/views/Home.vue'
// import Live from '@/views/Live.vue'

// const routes = [
//   { path: '/', component: Home },
//   { path: '/live', component: Live }
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// export default router
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import LiveParking from '../pages/LiveParking.vue'
import Forecast from '../pages/Forecast.vue'
import UrbanTrends from '../pages/UrbanTrends.vue'
// import History from '../pages/History.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/live', component: LiveParking },
  { path: '/forecast', component: Forecast },
  { path: '/urban-trends', component: UrbanTrends },
//   { path: '/history', component: History },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
