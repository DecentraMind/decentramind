<script setup lang="ts">
const { joinCommunity } = $(aoCommunityStore())
definePageMeta({
  layout: 'wip',
})
const { doLogin } = $(aoStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId)
const slug = $computed(() => route.params.slug)
//const invitor = $computed(() => route.params.invitor)

let communityIdPart = $ref()
let inviterAddress = $ref()

// onMounted(async () => {
//   setCurrentuuid(communityId)
//   await loadCommunityInfo(communityId)
// })
async function join() {
  await doLogin()

  await joinCommunity(communityIdPart, inviterAddress)
  const p = '/' + slug + '/discovery'
  console.log('join success')
  await useRouter().push({path: p})
}

onMounted( () => {
  const parts = communityId.split('&')
  communityIdPart = parts[0]
  inviterAddress = parts[1]

})
</script>

<template>
  <UPage>
    <UCard>
      <template #header>
        DecentraMind
      </template>
      <div class="flex justify-between">
        <div><Text>Invite to community:</Text></div>
        <div>{{ communityIdPart }}</div>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton color="white" label="Join" @click="join" />
        </div>
      </template>
    </UCard>
  </UPage>
</template>
