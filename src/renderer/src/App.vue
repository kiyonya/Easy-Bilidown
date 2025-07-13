<template>
  <div class="head">
    <div class="user" v-if="isLogin">
      <img :src="store.state.userProfile?.face" alt="" class="avatar">
      <div class="info">
        <span class="name">{{ store.state.userProfile?.uname }}</span>
        <img :src="store.state.userProfile?.vip?.label?.img_label_uri_hans_static" alt="" class="vip-label">
      </div>
    </div>
    <div class="login" v-if="!isLogin" @click="store.commit('showLoginWindow', true)">
      点击登录
    </div>
    <div class="routes">
      <RouterLink to="/home" class="route" active-class="route-active">首页</RouterLink>
      <RouterLink to="/task" class="route" active-class="route-active">任务</RouterLink>
      <RouterLink to="/tools" class="route" active-class="route-active">工具</RouterLink>
    </div>
    <div class="system">
      <button @click="minimizeApp">
        <Icon icon="fluent:line-horizontal-1-16-filled" />
      </button>
      <button @click="closeApp">
        <Icon icon="material-symbols:close" />
      </button>
    </div>
  </div>
  <RouterView class="router"></RouterView>
  <Login v-if="showLoginWindow"></Login>
</template>
<script setup>
import { Icon } from '@iconify/vue';
import Login from './components/Login.vue';
import store from './store';
import { computed, onMounted } from 'vue';
import router from './router';
const showLoginWindow = computed(() => store.state.showLoginWindow);
const isLogin = computed(() => store.state.isLogin);
function closeApp() {
  window.electron.ipcRenderer.send('mainwindow:close');
}
function minimizeApp() {
  window.electron.ipcRenderer.send('mainwindow:minimize');
}
onMounted(()=>{
  router.push({name: 'Home'})
})
</script>
<style scoped>
@keyframes active-route-underline {
  0% {
    width: 0;
  }

  100% {
    width: 100%;
  }

}

.head {
  width: 100%;
  height: fit-content;
  box-sizing: border-box;
  padding: 0.9rem 1.2rem 0.5rem 1.2rem;
  background: var(--component);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  color: var(--text);
  -webkit-app-region: drag;
  position: relative;
  justify-content: space-between;

  .user {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;


    .info {
      display: flex;
      flex-direction: column;

      .name {
        font-size: 1rem;
      }

      .vip-label {
        width: 4rem;
        object-fit: cover;
      }

    }

    .avatar {
      width: 2.3rem;
      aspect-ratio: 1/1;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  .routes {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-left: auto;
    margin-right: auto;

  }

  .system {
    display: flex;
    flex-direction: row;
    gap: 0.6rem;
    margin-left: auto;
    margin-right: 0;

    button {
      width: 1.8rem;
      height: 1.8rem;
      font-size: 1.5rem;
      border-radius: var(--br-1);
      background: none;
      border: none;
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-app-region: no-drag;
    }

    button:hover {
      background: var(--ui);

    }

    button:last-child:hover{
      background:rgb(253, 74, 74);
      color: white;
    }
  }
}

.router {
  width: 94%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-sizing: border-box;
  padding-top: 1rem;
  padding-bottom: 1.5rem;
  align-items: center;
}
.login{
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-o-1);
  -webkit-app-region: no-drag;
  cursor: pointer;
}
.login:hover{
  text-decoration: underline;
}
</style>
