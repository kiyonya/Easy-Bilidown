import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            name:"Home",
            path:'/home',
            component:()=>import('../views/Home.vue')
        },
        {
            name:"Task",
            path:'/task',
            component:()=>import('../views/TaskPending.vue')
        },
        {
            name:"TaskDownloading",
            path:'/task/downloading',
            component:()=>import('../views/TaskDownloading.vue')
        },
        {
            name:"Video",
            path:'/video/:id',
            component:()=>import('../views/Video.vue')
        },
        {
            name:"Tools",
            path:'/tools',
            component:()=>import('../views/Tools.vue')
        }
    ]
})

export default router