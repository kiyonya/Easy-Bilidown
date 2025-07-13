<template>
    <div class="page">
        <div class="focus-video">
            <img :src="info?.pic" alt="" class="cover">
            <h2 class="title">{{ info?.title }}</h2>
            <div class="subs">
                <span class="owner">UP:{{ info?.owner?.name }}</span>
                <span class="time">日期:{{ timestampToDate(info?.pubdate) }}</span>
            </div>
        </div>
        <div class="right">
            <div class="selector">
                <span>已选择{{ checkedVideos.length }}个视频</span>
                <button @click="commitTask">创建任务</button>
            </div>
            <div class="ugc-seasons">
                <h3 class="ti">
                    <span>合集: {{ info?.ugc_season?.title }}</span>

                    <div class="batch">
                        <input type="checkbox" name="" id="" @change="checkAllVideo()"
                            :checked="checkedVideos.length === info?.ugc_season?.sections?.reduce((acc, section) => acc + section.episodes.length, 0)">
                        <span>全选</span>
                    </div>
                </h3>
                <div class="section-selector">
                    <span v-for="section in info?.ugc_season?.sections" @click="displaySection = section?.id"
                        :class="{ 'highlight': section.id === displaySection }">{{
                            section?.title }}</span>
                </div>
                <div class="section" v-for="section in info?.ugc_season?.sections"
                    v-show="section.id === displaySection">
                    <div class="episodes">
                        <div class="episode" v-for="episode in section?.episodes"
                            @click.stop="handleEpisodeCheck(episode)">
                            <input type="checkbox" name="" id=""
                                :checked="checkedVideos.some(video => video.bvid === episode.bvid)"
                                @change="handleEpisodeCheck(episode)" @click.stop>
                            <span>{{ episode?.title }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { timestampToDate } from '../utils/time';
import store from '../store';
import router from '../router';
import { taskManager } from '../main';
let info = ref({})
let displaySection = ref(0)
let bvid = ref('')
let hasUGCSeason = ref(false)
let checkedVideos = ref([])
async function load(bvid) {
    const videoInfo = await window.electron.ipcRenderer.invoke('api:videoInfo', { bvid })
    console.log(videoInfo)
    info.value = videoInfo?.data
    displaySection.value = videoInfo?.data?.ugc_season?.sections?.[0]?.id || 0
    hasUGCSeason.value = !!videoInfo?.data?.ugc_season
    checkedVideos.value.push({
        bvid: videoInfo?.data?.bvid,
        title: videoInfo?.data?.title,
        aid: videoInfo?.data?.aid,
        cid: videoInfo?.data?.cid
    })
}
function checkAllVideo() {
    if (checkedVideos.value.length === info.value?.ugc_season?.sections?.reduce((acc, section) => acc + section.episodes.length, 0)) {
        checkedVideos.value = []
    } else {
        checkedVideos.value = info.value?.ugc_season?.sections.reduce((acc, section) => {
            return acc.concat(section.episodes.map(episode => ({
                bvid: episode.bvid,
                title: episode.title,
                aid: episode.aid,
                cid: episode.cid
            })))
        }, [])
    }
}
function handleEpisodeCheck(episode) {
    if (checkedVideos.value.some(video => video.bvid === episode.bvid)) {
        checkedVideos.value = checkedVideos.value.filter(video => video.bvid !== episode.bvid)
    } else {
        checkedVideos.value.push({
            bvid: episode.bvid,
            title: episode.title,
            aid: episode.aid,
            cid: episode.cid
        })
    }
}
function commitTask() {
    if (!checkedVideos.value.length) {
        alert("请选择至少一个视频")
    } else {
        taskManager.commitTask(checkedVideos.value).then(() => {
            router.push({
                name: "Task"
            })
        })

    }
}
onMounted(() => {
    const id = useRoute().params.id
    bvid.value = id
    load(id)
})
onUnmounted(() => {
    info.value = {}
    displaySection.value = 0
    bvid.value = ''
    hasUGCSeason.value = false
    checkedVideos.value = []
})
</script>
<style scoped>
.page {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
}

.focus-video {
    width: 45%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    background: var(--component);
    box-sizing: border-box;
    padding: 0.8rem;
    border-radius: var(--br-2);

    .cover {
        width: 100%;
        height: 10rem;
        object-fit: cover;
        border-radius: var(--br-1);
    }

    .title {
        font-size: 1rem;
        color: var(--text);
        margin-top: 0.2rem;
    }

    .subs {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        color: var(--text-o-2);
        font-size: 0.9rem;
    }
}

.right {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .selector {
        width: 100%;
        height: 2.7rem;
        background: var(--component);
        border-radius: var(--br-1);
        box-sizing: border-box;
        padding: 0.6rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .ugc-seasons {
        width: 100%;
        flex: 1;
        box-sizing: border-box;
        padding-top: 1rem;
        padding-bottom: 1.5rem;
        align-items: center;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--component);
        border-radius: var(--br-1);
        box-sizing: border-box;
        padding: 0.6rem;

        .section-selector {
            width: 100%;
            height: fit-content;
            background: var(--component);
            border-radius: var(--br-1);
            margin-bottom: 0.5rem;
            display: flex;
            flex-direction: row;
            gap: 0.6rem;
            box-sizing: border-box;
            padding: 0.3rem 0rem;

            span {
                cursor: pointer;
                position: relative;
                padding: 0.2rem 0;
            }

            span:hover {
                color: var(--strong);

            }

            .highlight {
                color: var(--strong);
                pointer-events: none;
            }

            .highlight::after {
                content: '';
                display: block;
                position: absolute;
                bottom: 0rem;
                width: 100%;
                height: 0.2rem;
                background-color: var(--strong);
                border-radius: 0.1rem;
            }
        }

        .section {
            flex: 1;
            width: 100%;
            overflow-y: auto;

            .episodes {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;

                .episode {
                    width: 95%;
                    height: fit-content;
                    background: var(--component);
                    border-radius: var(--br-1);
                    display: flex;
                    align-items: center;
                    padding: 0.3rem 0.5rem;
                    box-sizing: border-box;
                    color: var(--text-o-2);
                    font-size: 0.9rem;
                    cursor: pointer;

                    input[type="checkbox"] {
                        margin-right: 0.5rem;
                        display: block;
                        cursor: pointer;
                    }


                }

                .episode:has(input[type="checkbox"]:checked) {
                    background: var(--strong) !important;
                    color: var(--text);
                }
            }
        }


    }
}

.ti {
    width: 100%;
    font-size: 1rem;
    color: var(--text);
    font-weight: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.batch {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.2rem;
}

button {
    height: fit-content;
    width: fit-content;
    padding: 0.2rem 0.5rem;
    border-radius: var(--br-1);
    border: none;
    background-color: var(--ui);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text);
    font-size: 1rem;
    gap: 0.2rem;

    &:hover {
        background-color: var(--strong);
        color: var(--text);
    }
}
</style>