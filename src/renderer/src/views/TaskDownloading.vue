<template>
    <div class="page">
        <div class="task-page-router">
            <RouterLink to="/task" class="task-route" active-class="task-route-active">待下载</RouterLink>
            <RouterLink to="/task/downloading" class="task-route" active-class="task-route-active">下载中</RouterLink>
            <div class="total" v-if="total">
                <div class="total-progress">
                    <div class="total-progress-track" :style="{width:total?.progress + '%'}"></div>
                </div>
                <span>{{ total?.progress }}%</span>
                <span>{{ total?.speed }}/s</span>
            </div>
        </div>
        <div class="tasks" v-if="downloadingTasks.length">
            <div class="task"
                v-for="task in downloadingTasks">
                <img :src="task?.cover" alt="">
                <div class="info">
                    <h2 class="title">{{ task?.title }}</h2>
                    <div class="sub">
                        <span>BV:{{ task?.bvid }} </span>
                        <span>任务:{{ task?.uuid }}</span>
                    </div>
                    <div class="progress">
                        <div class="progress-track" :style="{ width: task?.progress + '%' }">
                        </div>
                    </div>
                    <div class="download-info">
                        <span>状态:{{ statusMap[task?.status] }}</span>
                        <span>进度:{{ task?.progress?.toFixed(0) }}%</span>
                        <span>速度:{{ formatBytes(task?.speed) }}/s</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="empty" v-else>
            <img src="../assets/img/anon-cry.png" alt="">
            <span>暂无进行的下载任务</span>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import store from '../store'
let statusMap = {
    'committed': '已提交',
    'downloading': '下载中',
    'merging': '合并中',
}
const tasks = computed({
    get: () => store.state.tasks,
    set: (value) => store.commit('updateTasks', value)
})
const downloadingTasks = computed(() => {
    return Array.from(tasks.value.values()).filter(i => i?.status === 'downloading' || i?.status === 'committed' || i?.status === 'merging')
})
const total = computed(() => {
    let pending = Array.from(tasks.value.values()).filter(i=>['committed','downloading'].includes(i.status))
    if(!pending || !pending.length){return null}
    let p = 0
    let s = 0
    for(let task of pending){
        p += task?.progress || 0
        s += task?.speed || 0
    }
    return {
        progress:(p / pending.length).toFixed(0),
        speed:formatBytes(s)
    }
})
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const dm = 1;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return value + ' ' + units[i];
}
</script>
<style scoped>
.page{
    display: flex;
    flex-direction: column;

}
.tasks {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-y: auto;

    .task {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 1rem;
        margin: 1rem 0;
        padding: 1rem;
        box-sizing: border-box;
        border-radius: var(--br-2);
        background-color: var(--component);
        color: var(--text);
        cursor: pointer;
        position: relative;


        img {
            width: 10rem;
            aspect-ratio: 4/3;
            object-fit: cover;
            border-radius: var(--br-1);
        }

        .info {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;

            .title {
                font-size: 1rem;
                font-weight: bold;
            }

            .sub {
                font-size: 0.9rem;
                color: var(--text-o-2);
                display: flex;
                align-items: center;
                gap: 0.5rem;

                span {
                    margin-right: 0.5rem;
                }
            }

            .download-info {
                display: flex;
                flex-direction: row;
                color: var(--text-o-2);
                font-size: 0.9rem;
                align-items: center;
                gap: 0.8rem;
            }

            .progress {
                width: 100%;
                height: 6px;
                background-color: var(--ui);
                border-radius: var(--br-1);
                overflow: hidden;
                position: relative;
                margin-top: auto;
                margin-bottom: 0;

                .progress-track {
                    height: 100%;
                    background-color: var(--strong);
                    transition: width 0.3s ease-in-out;
                }

            }
        }
    }
}

.total {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-left: 3rem;
    margin-right: auto;
    

    .total-progress {
        width: 25rem;
        height: 5px;
        background: var(--ui);
        position: relative;
        border-radius: 10px;
    }

    .total-progress-track {
        width: 100%;
        height: 100%;
        background: var(--strong);
        position: absolute;
        top: 0;
        left: 0;
        transition: width 0.3s ease-in-out;
        border-radius: 10px;
    }

    span {
        display: block;
        color: var(--text-o-2);
        font-size: 0.9rem;
    }
}
.empty{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-o-2);
    font-size: 1.1rem;
    gap: 1rem;

    img{
        width: 5rem;
        aspect-ratio: 1/1;
        object-fit: cover;
        opacity: 0.8;
    }
}
</style>