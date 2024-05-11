import axios from 'axios'
import {
    ElNotification,
    ElMessageBox,
    ElMessage,
    ElLoading,
} from 'element-plus'
import { getToken } from '@/utils/auth'
// import errorCode from "@/utils/errorCode"
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'
import { isRefreshRequest } from '@/api/login'
import router from "@/router"


let loadingInstance
// 是否显示重新登录
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: import.meta.env.VITE_APP_BASE_API,
    // // 超时
    // timeout: 10000
})

// request拦截器
service.interceptors.request.use(
    (config) => {
        // 是否需要设置 token
        const notRequireToken = (config.headers || {}).isToken === false
        // 是否需要防止数据重复提交
        const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
        if (!notRequireToken && !isRefreshRequest(config) && getToken('accessToken')) {
            //如果需要Token且不是刷新Token请求，则带上accessToken
            config.headers['Authorization'] = 'Bearer ' + getToken('accessToken')
        }
        if (
            !isRepeatSubmit &&
            (config.method === 'post' || config.method === 'put')
        ) {
            const requestObj = {
                url: config.url,
                data:
                    typeof config.data === 'object'
                        ? JSON.stringify(config.data)
                        : config.data,
                time: new Date().getTime(),
            }
            const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
            const limitSize = 5 * 1024 * 1024 // 限制存放数据5M
            if (requestSize >= limitSize) {
                console.warn(
                    `[${config.url}]: ` +
                        '请求数据大小超出允许的5M限制，无法进行防重复提交验证。'
                )
                return config
            }
            const sessionObj = cache.session.getJSON('sessionObj')
            if (
                sessionObj === undefined ||
                sessionObj === null ||
                sessionObj === ''
            ) {
                cache.session.setJSON('sessionObj', requestObj)
            } else {
                const s_url = sessionObj.url // 请求地址
                const s_data = sessionObj.data // 请求数据
                const s_time = sessionObj.time // 请求时间
                const interval = 1000 // 间隔时间(ms)，小于此时间视为重复提交
                if (
                    s_data === requestObj.data &&
                    requestObj.time - s_time < interval &&
                    s_url === requestObj.url
                ) {
                    const message = '数据正在处理，请勿重复提交'
                    console.warn(`[${s_url}]: ` + message)
                    return Promise.reject(new Error(message))
                } else {
                    cache.session.setJSON('sessionObj', requestObj)
                }
            }
        }

        if (request.isDownLoadFile) {
            request.responseType = 'blob'
            loadingInstance = ElLoading.service({
                text: '正在下载数据，请稍候',
                background: 'rgba(0, 0, 0, 0.7)',
            })
        }
        if (request.isUploadFile) {
            request.headers['Content-Type'] = 'multipart/form-data'
            loadingInstance = ElLoading.service({
                text: '文件上传中，请稍候...',
                background: 'rgba(0, 0, 0, 0.7)',
            })
        }
        return config
    },
    (error) => {
        console.log(error)
        Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    async (res) => {
        // 未设置状态码则默认成功状态
        const code = res.data.code
        if (res.config.isDownLoadFile) {
            return new Promise((resolve) => {
                blobValidate(res.data)
                    .then((validateRes) => {
                        if (validateRes === true) {
                            if (res.config.downloadMeta) {
                                resolve(res.data)
                                loadingInstance.close()
                                return
                            }
                            let contentDisposition =
                                res.headers['content-disposition']
                            let type = res.headers['content-type']
                            let reg = /filename\*=(.+)''(.+)/
                            let [, charset, filename] =
                                contentDisposition.match(reg)
                            saveAs(res.data, decodeURI(filename))
                            loadingInstance.close()
                            resolve({
                                code: 0,
                                message: 'success',
                                data: null,
                            })
                        } else {
                            ElMessage.error(
                                `下载出错:${
                                    validateRes.message ??
                                    '服务器发生了一个错误,请联系管理员处理'
                                }`
                            )
                            loadingInstance.close()
                            console.log('下载出错:', validateRes)
                        }
                    })
                    .catch((err) => {
                        console.log('err->', err)
                        loadingInstance.close()
                    })
            })
        } else if (res.config.isUploadFile) {
            loadingInstance.close()
        }
        if (code && code !== 0 && code !== 1) {
            if (code === 450) {
                if (isRefreshRequest(res.config)) {
                    //如果刷新token也过期了
                    console.log('刷新token过期了->')
                    return Promise.resolve(
                        '无效的会话，或者会话已过期，请重新登录。'
                    )
                } else {
                    const isSuccess = await useUserStore().refreshToken()
                    if (isSuccess) {
                        res.config.headers.Authorization = `Bearer ${getToken(
                            'accessToken'
                        )}`
                        return await service(res.config)
                    } else {
                        console.log('刷新token失败->')
                        //刷新失败，到登录页
                        if (!isRelogin.show) {
                            isRelogin.show = true
                            ElMessageBox.confirm(
                                '登录状态已过期，您可以继续留在该页面，或者重新登录',
                                '系统提示',
                                {
                                    confirmButtonText: '重新登录',
                                    cancelButtonText: '取消',
                                    type: 'warning',
                                }
                            )
                                .then(() => {
                                    isRelogin.show = false
                                    useUserStore()
                                        .logOut()
                                        .then(() => {
                                            location.href = '/index'
                                        })
                                })
                                .catch(() => {
                                    isRelogin.show = false
                                })
                        }
                        return Promise.reject(
                            '无效的会话，或者会话已过期，请重新登录。'
                        )
                    }
                }
            } else {
                ElMessage({
                    message: `请求出错[${res.data.code}]:${res.data.message}`,
                    type: 'error',
                })
                res.data.api = res.config.url
                return Promise.reject(res.data)
            }
        }

        if (code === 1) {
            //控制台打印警告信息
            console.warn('[Request warn]: ' + res.data.message)
            // ElMessage({ message: res.data.message, type: "warning" })
        }
        return res.data
    },
    async (err) => {
        console.error('err->' + err)
        if (
            err.config.isDownLoadFile &&
            err.response.data instanceof Blob &&
            err.response.data.type === 'application/json'
        ) {
            try {
                let text = await err.response.data.text()
                err.response.data = JSON.parse(text)
            } catch (err) {
                ElMessage({
                    message: `错误码500:服务器出现了一个错误,请联系管理员处理`,
                    type: 'error',
                    duration: 5 * 1000,
                })
                return Promise.reject(err.response.data)
            }
        }
        let { message } = err
        if (message == 'Network Error') {
            message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
            message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
            if(err.response.status === 401){
                message = '没有权限访问'
                router.push({
                    path:'/login'
                })
            }else{
                message = '系统接口' + message.substr(message.length - 3) + '异常'
            }
        }
        ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
        return Promise.reject(err)
    }
)

// 通用下载方法
export function download(url, params, filename, config) {
    loadingInstance = ElLoading.service({
        text: '正在下载数据，请稍候',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    return service
        .post(url, params, {
            transformRequest: [
                (params) => {
                    return tansParams(params)
                },
            ],
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            responseType: 'blob',
            ...config,
        })
        .then(async (data) => {
            const isBlob = blobValidate(data)
            if (isBlob) {
                const blob = new Blob([data])
                saveAs(blob, filename)
            } else {
                const resText = await data.text()
                const rspObj = JSON.parse(resText)
                const errMsg =
                    errorCode[rspObj.code] || rspObj.msg || errorCode['default']
                ElMessage.error(errMsg)
            }
            loadingInstance.close()
        })
        .catch((r) => {
            console.error(r)
            ElMessage.error('下载文件出现错误，请联系管理员！')
            loadingInstance.close()
        })
}

export function request({
    url,
    data,
    method,
    params,
    isUploadFile,
    isDownLoadFile,
    downloadMeta,
    baseURL,
    timeout,
    headers,
}) {
    return service({
        url: url,
        method: method ?? 'get',
        data: data ?? {},
        params: params ?? {},
        isUploadFile: isUploadFile ?? false,
        isDownLoadFile: isDownLoadFile ?? false,
        downloadMeta: downloadMeta ?? false,
        baseURL: baseURL,
        timeout: timeout ?? import.meta.env.VITE_APP_API_TIMEOUT,
        headers: headers ?? {},
    })
}

export default request
