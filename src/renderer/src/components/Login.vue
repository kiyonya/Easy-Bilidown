<template>
    <ModalWindow :title="'扫码登录'" :mask="false" @close="store.commit('showLoginWindow', false)">
        <div class="loginwindow">
        <img :src="qrimg" alt="" crossorigin="anonymous">
        <span>{{ msg }}</span>
        </div>
    </ModalWindow>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import store from '../store';
import { login } from '../api/auth';
import ModalWindow from './ModalWindow.vue';
const qrimg = ref('')
const msg = ref('等待扫码')
let pollInterval = null

async function qrcodeLogin() {
    const qrGen = await window.electron.ipcRenderer.invoke('api:qrcodeGenerate', { dataURL: true })
    qrimg.value = qrGen?.dataURL
    let qrkey = qrGen.data.qrcode_key
    pollInterval = setInterval(async () => {
        const pollResult = await window.electron.ipcRenderer.invoke('api:qrcodePoll', { qrkey })
        if (pollResult?.data?.code === 86101) {
            msg.value = "等待扫码"
        }
        else if (pollResult?.data?.code === 86090) {
            msg.value = "已扫描，请确认"
        }
        else if (pollResult?.data?.code === 0 && pollResult?.data?.refresh_token) {
            msg.value = "登陆成功"
            clearInterval(pollInterval)
            const {cookie,refresh_token} = pollResult?.data
            handleUserLogin(cookie,refresh_token)
            console.log(pollResult)
        }
        else if (pollResult?.data?.code === 86038) {
            msg.value = "已过期，重置"
            clearInterval(pollInterval)
            //听不见 重来
            qrcodeLogin()
        }
    }, 1000);
}
async function handleUserLogin(cookie,token) {
    localStorage.setItem('user_cookie',cookie)
    localStorage.setItem('app_token',token)
    login(cookie)
}
onMounted(async () => {
    qrcodeLogin()
})
onUnmounted(() => {
    if (pollInterval) {
        clearInterval(pollInterval)
    }
})
</script>
<style scoped>
.loginwindow {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    img{
        width: 10rem;
        height: 10rem;
        border-radius: var(--br-1);
    }
}

</style>