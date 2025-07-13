import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { login } from './api/auth'
import './assets/main.css'
import TaskManager from './lib/task'

class BiliVideoDownloaderApplication {
  constructor() {
    this.taskManager = new TaskManager()
  }

  async initialize() {
    this.createVueApp()
    await this.handleAuthentication()
    this.setupTaskManager()
  }

  createVueApp() {
    const app = createApp(App)
    app.use(router)
    app.use(store)
    app.config.globalProperties.$store = store
    app.mount('#app')
  }

  async handleAuthentication() {
    const cookie = localStorage.getItem('user_cookie')
    try {
      const l = await login(cookie)
      if (!l) {
        store.commit('showLoginWindow',true)
      }
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  setupTaskManager() {
    this.taskManager.setProgressMonitor()
  }

  getTaskManager() {
    return this.taskManager
  }
}
const appInstance = new BiliVideoDownloaderApplication()
export const taskManager = appInstance.getTaskManager()
appInstance.initialize()