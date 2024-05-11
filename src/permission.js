import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken,removeToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import store from '@/store'
NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/login/oauth2/code', '/login/wx']


router.beforeEach((to, from, next) => {
    NProgress.start()
    if (getToken('accessToken')) {
        to.meta.title && useSettingsStore().setTitle(to.meta.title)
        /* has token*/
        if (to.path === '/login') {
            next({ path: '/' })
            NProgress.done()
        } else if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            if (useAppStore().isRefresh) {
                // 判断当前用户是否已拉取完user_info信息
                useUserStore()
                    .getUserInfo()
                    .then(() => {
                        usePermissionStore()
                            .generateRoutes()
                            .then((accessRoutes) => {
                                // 根据roles权限生成可访问的路由表
                                accessRoutes.forEach((route) => {
                                    if (!isHttp(route.path)) {
                                        router.addRoute(route) // 动态添加可访问路由表
                                    }
                                })
                                store.commit('app/CHANGE_REFRESH_STATUS', false)
                                next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
                            })
                    })
                    .catch((err) => {
                        useUserStore()
                            .logOut()
                            .then(() => {
                                ElMessage.error(err)
                                next({ path: '/' })
                            }).catch(err=>{
                                console.log('logout err->',err)
                                removeToken('accessToken')
                                removeToken('refreshToken')
                            })
                    })
            } else {
                next()
            }
            NProgress.done()
        }
    } else {
        // 没有token
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next()
        } else {
            next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
