<template>
    <div class="page">
        <div class="search">
            <input type="text" placeholder="输入BV号/链接" class="search-ipt" :value="processedInputValue" @input="handleInput" @compositionstart="composition = true" @compositionend="composition = false"/>
            <button @click="doSearch">
                 <Icon icon="material-symbols:search" style="font-size: 1.2em;"/>
                <span >搜索</span>
            </button>
        </div>

        <div class="bottom">
            <a href="https://github.com/kiyonya/Easy-Bilidown" target="_blank">
                <Icon icon="mdi:github" />
                Easy-Bilidown
            </a>
            <span>
                v{{ store.state.version }}
            </span>
            <span>MIT LICENSE</span>
        </div>
    </div>
</template>
<script setup>
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';
import router from '../router';
import store from '../store';
const processedInputValue = ref('')
let composition = false
function handleInput(e){
    if(composition){return}
    let inputValue = e.target.value
    try {
        //判断是不是连接
        let url = new URL(inputValue)
        if(url.hostname === 'www.bilibili.com' && url.pathname.startsWith('/video')){
            let bv = url.pathname.split('/').filter(i=>i.startsWith('BV') && i.length === 12)[0]
            if(bv){
                processedInputValue.value = bv
            }
        }
    } catch (error) {
        processedInputValue.value = inputValue
    }
}
function doSearch(){
    if(!processedInputValue.value || !processedInputValue.value.trim().startsWith('BV')){
        return
    }
    console.log(processedInputValue.value)
    router.push({
        name:"Video",
        params:{
            id:processedInputValue.value.trim()
        }
    })
}
</script>
<style scoped>
.search {
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;

    .search-ipt {
       flex: 1;
        height: 2.5rem;
        padding: 0 1rem;
        border-radius: var(--br-1);
        border: none;
        background-color: var(--component);
        color: var(--text);
        font-size: 1.1rem;
    }

    .search-ipt:focus {
        outline: 2px solid var(--strong);
    }
    button {
        width: 5rem;
        height: 2.5rem;
        border-radius: var(--br-1);
        border: none;
        background-color: var(--component);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-o-1);
        font-size: 1rem;
        gap: 0.2rem;

        &:hover {
            background-color: var(--strong);
        }
    }
}
.bottom{
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: auto;
    margin-bottom: 0;

    a,span{
        text-decoration: none;
        color: var(--text-o-1);
        background: var(--ui);
        padding: 0.2rem 0.5rem;
        border-radius: var(--br-1);
        display: flex;
        align-items: center;
    }
    a:hover{
        text-decoration: underline;
    }
}
</style>