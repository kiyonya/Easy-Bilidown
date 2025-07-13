<template>
    <div class="page">
        <div class="task-page-router">
            <RouterLink to="/task" class="task-route" active-class="task-route-active">待下载</RouterLink>
            <RouterLink to="/task/downloading" class="task-route" active-class="task-route-active">下载中</RouterLink>
            <button class="ui-button" style="margin-left: auto;margin-right: 0;" @click="changeSavePath">{{
                config?.savePath
                || '点击选择保存位置' }}</button>
            <button class="ui-button" @click="showBatchWindow = true">批量操作</button>
            <button class="ui-button" @click="commitTask">提交任务</button>
        </div>

        <div class="tasks" v-if="pendingTasks.length">
            <div class="task" v-for="task in pendingTasks" :key="task.bvid">
                <button class="close" title="删除任务" @click="deleteTask(task.uuid)">
                    <Icon icon="material-symbols:close" />
                </button>
                <div class="normal">
                    <img :src="task.cover" alt="">
                    <div class="info">
                        <h2 class="title">{{ task?.title }}</h2>
                        <div class="sub">
                            <span>BV:{{ task?.bvid }} </span>
                            <span>发布:{{ timestampToDate(task?.pubDate) }}</span>
                            <span>时长:{{ task.duration }}秒</span>
                        </div>
                        <div class="selector">
                            <div>
                                <span>音频</span>
                                <select name="" id="" class="v" @change="handleAudioChange(task.uuid, $event)"
                                    :value="task?.userSelect?.downloadAudio ? task?.userSelect?.audio?.index : '-1'">
                                    <option value="-1" class="null">无音频</option>
                                    <option :value="a?.index" v-for="(a, index) in task?.audios">{{ Math.round(a.bandwidth / 1024) }}Kbps
                                    </option>
                                </select>
                            </div>
                            <div>
                                <span>视频</span>
                                <select name="" id="" class="v" @change="handleVideoChange(task.uuid, $event)"
                                    :value="task?.userSelect?.downloadVideo ? task?.userSelect?.video?.index : '-1'">
                                    <option value="-1" class="null">无视频</option>
                                    <option :value="v?.index" v-for="(v, index) in task?.videos">{{ v.name }} | {{
                                        v.codec?.split('.')[0] }}</option>
                                </select>
                            </div>
                            <div v-if="task?.lang.length > 0">
                                <span>字幕</span>
                                <select name="" id="" class="v" @change="handleLangChange(task.uuid, $event)"
                                    :value="task?.userSelect?.downloadLang ? task?.userSelect?.lang?.index : '-1'">
                                    <option value="-1" class="null">不下载字幕</option>
                                    <option :value="l?.index" v-for="(l, index) in task?.lang">{{ l.doc }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="download-info">
                            <span v-if="task?.userSelect?.downloadAudio">音频大小:{{
                                (+task?.userSelect?.audio?.size).toFixed(1)
                                }}MB</span>
                            <span v-if="task?.userSelect?.downloadVideo">视频大小:{{
                                (+task?.userSelect?.video?.size).toFixed(1)
                                }}MB</span>
                            <span v-if="task?.userSelect?.downloadVideo">视频画幅:{{ task?.userSelect?.video?.width }}x{{
                                task?.userSelect?.video?.height }}</span>
                            <span v-if="task?.userSelect?.downloadVideo">帧率:{{ task?.userSelect?.video?.frameRate
                                }}FPS</span>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="ccb">
                        <input type="checkbox" name="" id="" :checked="task?.userSelect?.downloadCover"
                            @change="handleCheck(task.uuid, 'downloadCover', $event)">
                        <span>下载封面</span>
                    </div>
                    <div class="ccb">
                        <input type="checkbox" name="" id="" :checked="task?.userSelect?.danmakuXml"
                            @change="handleCheck(task.uuid, 'danmakuXml', $event)">
                        <span>下载XML弹幕</span>
                    </div>
                    <div class="ccb">
                        <input type="checkbox" name="" id="" :checked="task?.userSelect?.danmakuAss"
                            @change="handleCheck(task.uuid, 'danmakuAss', $event)">
                        <span>下载ASS弹幕</span>
                    </div>
                    <div class="quick-action">
                        <button style="margin-left: auto;margin-right: 0;"
                            @click="DownloadAPI.donwloadCover(task?.uuid)">导出封面</button>
                        <button @click="DownloadAPI.downloadAudio(task?.uuid)" v-if="task?.userSelect?.audio">导出音频</button>
                        <button v-if="task?.userSelect?.lang" @click="DownloadAPI.downloadSRT(task?.uuid)">导出字幕 | {{
                            task?.userSelect?.lang?.doc }}</button>
                    </div>

                </div>
            </div>
        </div>
        <div class="empty" v-else>
            <img src="../assets/img/anon-cry.png" alt="">
            <span>暂无提交的下载任务</span>
        </div>

        <ModalWindow v-if="showBatchWindow" title="批量操作" @close="showBatchWindow = false">
            <div class="batch-window">
                <span>所有的任务都将：</span>
                <div class="batch" v-for="item in batchOptions" :key="item.key">
                    <input type="checkbox" :checked="pendingTasks?.every(i => i.userSelect?.[item.key])"
                        @change="handleBatchItemCheck(item.key, $event)">
                    <span>{{ item.label }}</span>
                </div>
            </div>
        </ModalWindow>

    </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import store from '../store';
import { timestampToDate } from '../utils/time';
import { Icon } from '@iconify/vue';
import { RouterLink } from 'vue-router';
import { taskManager } from '../main';
import router from '../router';
import ModalWindow from '../components/ModalWindow.vue';
import DownloadAPI from '../lib/download';
const showBatchWindow = ref(false)
const tasks = computed({
    get: () => store.state.tasks,
    set: (value) => store.commit('updateTasks', value)
})
const pendingTasks = computed(() => {
    return Array.from(tasks.value.values()).filter(i => i?.status === 'pending')
})
const config = computed({
    get: () => store.state.config,
    set: ({ key, value }) => store.commit('config', { key, value })
})
const batchOptions = [
  { key: 'downloadCover', label: '下载封面' },
  { key: 'downloadLang', label: '下载字幕（如果有的话）' },
  { key: 'danmakuXml', label: '下载XML弹幕' },
  { key: 'danmakuAss', label: '下载ASS弹幕' },
  { key: 'downloadAudio', label: '下载音频' },
  { key: 'downloadVideo', label: '下载视频' }
];
function handleVideoChange(uuid, event) {
    let task = tasks.value.get(uuid)
    let index = event.target.value;
    if (index === '-1') {
        task.userSelect.downloadVideo = false;
        return;
    }
    else {
        task.userSelect.downloadVideo = true;
        task.userSelect.video = task.videos[index];
    }

}
function handleAudioChange(uuid, event) {
    let task = tasks.value.get(uuid)
    let index = event.target.value;
    if (index === '-1') {
        task.userSelect.downloadAudio = false;
        return;
    }
    else {
        task.userSelect.downloadAudio = true;
        task.userSelect.audio = task.audios[index];
    }

}
function handleLangChange(uuid, event) {
    let task = tasks.value.get(uuid)
    let index = event.target.value;
    if (index === '-1') {
        task.userSelect.downloadLang = false;
        return;
    }
    else {
        task.userSelect.downloadLang = true;
        task.userSelect.lang = task.lang[index];
    }

}
function deleteTask(uuid) {
    tasks.value.delete(uuid)
}
function commitTask() {
    taskManager.postTask()
    router.push({ name: 'TaskDownloading' })
}
async function changeSavePath() {
    const paths = await window.electron.ipcRenderer.invoke('dialog:openDialog', {
        title: "选择下载保存目录"
    })
    if (paths?.length) {
        config.value = { key: 'savePath', value: paths[0] }
    }
}
function handleCheck(uuid, type, event) {
    let task = tasks.value.get(uuid)
    if (!task) { return }
    task.userSelect[type] = event.target.checked
}
function handleBatchItemCheck(type, event) {
    let checked = event.target.checked
    for (let task of pendingTasks.value) {
        if (checked) {
            task['userSelect'][type] = true
        }
        else {
            task['userSelect'][type] = false
        }
    }
}
</script>
<style scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 0.5rem;
}

.tasks {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    overflow-y: auto;

    .task {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin: 1rem 0;
        padding: 1rem;
        border-radius: var(--br-2);
        background-color: var(--component);
        color: var(--text);
        cursor: pointer;
        position: relative;

        .normal {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            gap: 1rem;
        }

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

            .selector {
                display: flex;
                align-items: center;
                gap: 1rem;
                width: 100%;
                overflow: hidden;
                margin-top: auto;
                margin-bottom: 0;

                div {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;

                    span {
                        font-size: 0.9rem;
                        color: var(--text-o-2);
                        white-space: nowrap;
                    }

                    select {
                        max-width: 9rem;
                        width: fit-content;
                        padding: 0.2rem 0.5rem;
                        border-radius: var(--br-1);
                        background-color: var(--ui);
                        color: var(--text);
                        border: none;
                        font-size: 0.8rem;
                        cursor: pointer;
                    }

                    option {
                        background: var(--component);
                        color: var(--text);
                    }

                    .null {
                        background: rgb(223, 41, 41);
                        color: white;
                    }
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
        }
    }

    .bottom {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-top: 1px solid var(--border);
        padding-top: 0.4rem;
        gap: 1rem;

        .ccb {
            display: flex;
            flex-direction: row;
            gap: 0.3rem;

        }

        .quick-action {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-left: auto;
            margin-right: 0;
            gap: 0.5rem;
            border-left: 2px solid var(--border);
            padding-left: 0.6rem;

            button {
                background: var(--component);
                color: var(--text-o-1);
                border: none;
                padding: 0.3rem 0.6rem;
                border-radius: var(--br-1);
                cursor: pointer;
                font-size: 0.8rem;

                &:hover {
                    background-color: var(--strong);
                    color: white;
                }
            }
        }




    }

    .close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-o-2);
        font-size: 1.5rem;
    }

    .close:hover {
        color: var(--strong);
    }
}

.empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-o-2);
    font-size: 1.1rem;
    gap: 1rem;

    img {
        width: 5rem;
        aspect-ratio: 1/1;
        object-fit: cover;
        opacity: 0.8;
    }
}

.batch-window {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    span {
        color: var(--text-o-2);
        font-size: 0.9rem;
    }

    .batch {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        input[type="checkbox"] {
            cursor: pointer;
            width: 1rem;
            height: 1rem;
        }

        span {
            font-size: 0.9rem;
            color: var(--text-o-2);
        }
    }
}
</style>