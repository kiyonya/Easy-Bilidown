import { createStore } from "vuex";
const store = createStore({
    state:{
        version:'0.2.5',
        isLogin:true,
        showLoginWindow:false,
        userProfile:null,
        committedTasks:[],
        tasks:new Map(),
        progressMap:new Map(),
        config:{
            ...{
                savePath:"",
                
            },
            ...JSON.parse(localStorage.getItem('user_config')) || {},
        }
    },
    mutations:{
        updateLogin(state,value){
            state.isLogin = value
        },
        updateUserProfile(state,value){
            state.userProfile = value
        },
        commitTask(state,value){
            if(!Array.isArray(value)){return}
            state.committedTasks = value
        },
         updateTasks(state,value){
            if(!Array.isArray(value)){return}
            state.tasks = value
        },
        config(state,{key,value} = c){
            state.config[key] = value
            localStorage.setItem('user_config',JSON.stringify(state.config))
        },
        updateProgress(state,{id,e}){
            state.progressMap.set(id,e)
        },
        showLoginWindow(state,value){
            state.showLoginWindow = value
        }
    },
})
export default store