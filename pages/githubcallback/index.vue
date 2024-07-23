<template>
  <div>
    <h1>正在认证...</h1>
    <!--<UButton @click=test>test</UButton>-->
  </div>
</template>


<script setup>

definePageMeta({
  layout: 'wip',
})

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
const { userInfo, getUser } = $(aoCommunityStore())

onMounted(async () => {
    const code = new URLSearchParams(window.location.search).get('code')
    const state = new URLSearchParams(window.location.search).get('state')

    await getUser()

    const connectGithub = 'Success'
    //const connectGithub = user.value.user_metadata.provider_id
    if (code && state === 'state') {
        try {
            await personalInfo(
                userInfo[0].avatar,
                userInfo[0].name,
                userInfo[0].twitter,
                userInfo[0].showtwitter,
                userInfo[0].mail,
                userInfo[0].showmail,
                userInfo[0].phone,
                userInfo[0].showtelegram,
                connectGithub
            )
            toast.add({ title: 'github updated', icon: 'i-heroicons-check-circle' })

        } catch (error) {
        console.error('错误:', error)
        }
    } else {
        console.error('没有 code 或者 state 无效')
    }

    router.push('/dm')

})

</script>

