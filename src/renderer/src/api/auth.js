import store from "../store"
export async function login(cookie) {
  if (!cookie) {
    store.commit('updateLogin', false)
    store.commit('updateUserProfile', null)
    return false
  } else {
    const userProfile = await window.electron.ipcRenderer.invoke('api:userInfo', { cookie })
    if (userProfile?.data?.isLogin) {
      //侧石
      store.commit('updateLogin', true)
      store.commit('updateUserProfile', userProfile?.data)
      store.commit('showLoginWindow',false)
      return true
    } else {
      store.commit('updateLogin', false)
      store.commit('updateUserProfile', null)
      return false
    }
  }
}
export async function logout() {
  localStorage.removeItem('user_cookie')
  store.commit('updateLogin', false)
  store.commit('updateUserProfile', null)
}