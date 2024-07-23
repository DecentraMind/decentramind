<template>
  <!--  <div>-->
  <!--    <h1>正在认证...</h1>-->
  <!--    <UButton @click="test">test</UButton>-->
  <!--  </div>-->
  <UPage>
    <UCard>
      <template #header>
        DecentralMind
      </template>
      <div class="flex justify-center, items-center">
        <div>Saving User Info to AO.</div>
      </div>
    </UCard>
  </UPage>
</template>


<script setup>

definePageMeta({
  layout: 'wip',
})

import {onMounted} from 'vue'
import {useRouter} from 'vue-router'

const toast = useToast()
const {userInfo, getUser: getInfo, personalInfo} = $(aoCommunityStore())
const Sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
let resCode = $ref('')
let userId = $ref('')
onMounted(async () => {
  const router = useRouter()
  const code = new URLSearchParams(window.location.search).get('code')
  const state = new URLSearchParams(window.location.search).get('state')
  resCode = code
  console.log('resCode = ' + resCode)
  await Sleep(500)
  await test()
  console.log('userId = ' + userId)
  await getInfo()
  const connectTwitter = userId

  if (code && state === 'state' && userId) {
    try {
      await personalInfo(
        userInfo[0].avatar,
        userInfo[0].name,
        connectTwitter,
        userInfo[0].showtwitter,
        userInfo[0].mail,
        userInfo[0].showmail,
        userInfo[0].phone,
        userInfo[0].showtelegram
      )
      toast.add({title: 'Profile updated', icon: 'i-heroicons-check-circle'})

    } catch (error) {
      console.error('错误:', error)
    }
  } else {
    console.error('没有 code 或者 state 无效')
  }

  router.push('/dm')
})
const test = async () => {
  try {
    console.log('start get user id')
    let query = computed(() => ({code: resCode}))
    const {data} = await useFetch('/api/getAccessToken', {query})
    console.log('getToken data = ' + JSON.stringify(data._rawValue))
    const accessToken = data._rawValue.access_token
    console.log('accessToken = ' + accessToken)
    // const finalAccessToken = `Bearer ${accessToken}`
    // console.log('finalAccessToken = ' + finalAccessToken)
    query = computed(() => ({accessToken: accessToken}))
    const res = await useFetch('/api/getTwitterUserId', {query})
    const response = res.data._rawValue
    console.log('res = ' + JSON.stringify(response))
    console.log('userId = ' + response.data.id)
    userId = response.data.id
  } catch (error) {
    console.log(error)
  }
}

</script>
