<template>
    <div></div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { decrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'

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
        .loginCode(query.code)
        .then((res) => {
            router.push({
                path: state.redirect || '/',
                query: state.query || {},
            })
        })
        .catch((err) => {
            console.error('err->',err)
            ElMessage.closeAll()
            ElMessage.error('登录失败,请重试或联系管理员处理')
            router.push({
                path: '/login',
            })
        })
}
</script>
