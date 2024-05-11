import { login, logout, loginCode,loginWX } from '@/api/login'
import { getUserInfo } from '@/api/system/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
import { refreshToken } from '@/api/login'
import router from "@/router"
import dateUtil from '@/utils/dateUtil'


let refreshTokenPromise

const useUserStore = defineStore('user', {
    state: () => ({
        token: getToken(),
        id: '',
        name: '',
        avatar: '',
        roles: [],
        permissions: [],
    }),
    actions: {
        // 登录
        login(userInfo) {
            const username = userInfo.username.trim()
            const password = userInfo.password
            const code = userInfo.code
            const uuid = userInfo.uuid
            return new Promise((resolve, reject) => {
                login(username, password, code, uuid)
                    .then((res) => {
                        setToken('accessToken', res.data.accessToken)
                        setToken('refreshToken', res.data.refreshToken)
                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                getUserInfo()
                    .then((res) => {
                        const user = res.data
                        const avatar =
                            user.avatar == '' || user.avatar == null
                                ? defAva
                                : import.meta.env.VITE_APP_BASE_API +
                                  user.avatar

                        this.roles = res.data.roles
                        this.permissions = res.data.permissions

                        this.id = user.empLoginid
                        this.name = user.empName
                        this.avatar = avatar
                        resolve(res.data)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },
        // 退出系统
        logOut() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(() => {
                        resolve()
                    })
                    .catch((error) => {
                        reject(error)
                    }).finally(()=>{
                        this.token = ''
                        this.roles = []
                        this.permissions = []
                        removeToken('accessToken')
                        removeToken('refreshToken')
                        router.push({path:'/login'})
                    })
            })
        },

        loginWX(code) {
            return new Promise((resolve, reject) => {
                loginWX(code)
                    .then((res) => {
                        setToken('accessToken', res.data.accessToken)
                        setToken('refreshToken', res.data.refreshToken)
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },

        loginCode(code) {
            return new Promise((resolve, reject) => {
                loginCode(code)
                    .then((res) => {
                        setToken('accessToken', res.data.accessToken)
                        setToken('refreshToken', res.data.refreshToken)
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
        },

        async refreshToken() {
            if (refreshTokenPromise) {
                return refreshTokenPromise
            }
            refreshTokenPromise = new Promise(async (resolve, reject) => {
                let res
                try{
                    res = await refreshToken()
                    if (res.code === 0) {
                        setToken('accessToken', res.data.accessToken)
                        setToken('refreshToken', res.data.refreshToken)
                        console.log("token refreshed at ", dateUtil.format(new Date()))
                    }
                    resolve(res.code === 0)

                }catch(err){
                    reject(err)
                }
            }).catch(err=>{
                return false
            }).finally(()=>{
                refreshTokenPromise = null
              })
            return refreshTokenPromise
        },
    },
})

export default useUserStore
