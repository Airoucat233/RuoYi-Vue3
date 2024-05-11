<template>
  <div ref="wxCodeLogin"></div>
</template>

<script setup>
import * as ww from '@wecom/jssdk'
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { decrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'

const wxCodeLogin = ref(null)

// const wwLogin = ww.createWWLoginPanel({
//   el: '#ww_login',
//   params: {
//     login_type: 'CorpApp',
//     appid: 'wwbbb6a7b539f2xxxxx',
//     agentid: '10000xx',
//     redirect_uri: 'https://work.weixin.qq.com',
//     state: 'loginState',
//     redirect_type: 'callback',
//   },
//   onCheckWeComLogin({ isWeComLogin }) {
//     console.log(isWeComLogin)
//   },
//   onLoginSuccess({ code }) {
//     console.log({ code })
//   },
//   onLoginFail(err) {
//     console.log(err)
//   },
// })
// console.log('wwl->',wwLogin)

// onMounted(() => {
//   wxCodeLogin.value.appendChild(wwLogin.el);
// })
const route = useRoute()
const router = useRouter()
const { query } = route
const userStore = useUserStore()

let state = {}
if (query.state) {
    let decrypted = decrypt(query.state)
    state = JSON.parse(decrypted)
}

if (query.code) {
    userStore
        .loginWX(query.code)
        .then((res) => {
            router.push({
                path: state?.redirect || '/',
                query: state?.query || {},
            })
        })
        .catch((err) => {
            ElMessage.closeAll()
            ElMessage.error('登录失败,请重试或联系管理员处理')
            router.push({
                path: '/login',
            })
        })
}

</script>