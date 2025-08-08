import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import UrbanTrends from '../pages/UrbanTrends.vue'
import Live from '../pages/Live.vue'
import Forecast from '../pages/Forecast.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/urban-trends',
    name: 'UrbanTrends',
    component: UrbanTrends
  },
  {
    path: '/live',
    name: 'Live',
    component: Live
  },
  {
    path: '/forecast',
    name: 'Forecast',
    component: Forecast
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
