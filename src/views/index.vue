<template>
    <div class="app-container home">
        <el-button @click="request1">请求1 </el-button>
        <el-button @click="request2">请求2 </el-button>
    </div>
</template>

<script setup name="Index">
import { example1,example2 } from '@/api/demo'
import { ElMessage } from 'element-plus';

const request1 = () => {
    example1().then(res=>{
        ElMessage.success(res)
    })
}
const request2 = () => {
    example2().then(res=>{
        ElMessage.success(res)
    })
}
</script>

<style scoped lang="scss"></style>
