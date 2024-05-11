import request from '@/utils/request'
import { getToken } from '@/utils/auth'


// 登录方法
export function login(username, password, code, uuid) {
    const data = {
        username,
        password,
        code,
        uuid,
    }
    return request({
        url: '/login/password',
        headers: {
            isToken: false,
            repeatSubmit: false,
        },
        method: 'post',
        data: data,
    })
}

// 注册方法
export function register(data) {
    return request({
        url: '/register',
        headers: {
            isToken: false,
        },
        method: 'post',
        data: data,
    })
}

// // 获取用户详细信息
// export function getInfo() {
//   return request({
//     url: '/getInfo',
//     method: 'get'
//   })
// }

// 退出方法
export function logout() {
    return request({
        url: '/login/logout',
        method: 'get',
        headers: {
            isToken: false,
        },
        params:{
            token:getToken('accessToken')
        }
    })
}

// 获取验证码
export function getCodeImg() {
    return request({
        url: '/captchaImage',
        headers: {
            isToken: false,
        },
        method: 'get',
        timeout: 20000,
    })
}

//统一认证中心登录
export function loginCode(code) {
    return request({
        url: '/login/code',
        method: 'get',
        headers:{
            isToken:false
        },
        params: {
            code,
        },
    })
}
//企业微信登录
export function loginWX(code) {
    return request({
        url: '/login/wx',
        method: 'get',
        headers:{
            isToken:false
        },
        params: {
            code,
        },
    })
}

export function refreshToken() {
    return request({
        url: '/login/refreshToken',
        method: 'get',
        headers: {
            __isRefreshToken: true  
        },
        params:{
            token: getToken('refreshToken')
        }
    })

}

export function isRefreshRequest(config){
    return !!config.headers?.__isRefreshToken
}
