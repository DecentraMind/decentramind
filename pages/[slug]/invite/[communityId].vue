<script setup lang="ts">
const { joinCommunity } = $(aocommunityStore())
definePageMeta({
  layout: "wip",
});
const { address, doLogin } = $(aoStore())
const route = useRoute()
const communityId = $computed(() => route.params.communityId)
// const { joinCommunity } = $(aocommunityStore())
const slug = $computed(() => route.params.slug)

// onMounted(async () => {
//   setCurrentuuid(communityId)
//   await loadCommunityInfo(communityId)
// })
async function join() {
  await doLogin()
  console.log('add = ' + address)

  await joinCommunity(communityId)
  console.log('join success')
  await useRouter().push({path: '/${slug}/discovery'})
}

</script>

<template>
  <UPage>
    <UCard>
      <template #header>
        DecentralMind
      </template>
      <div class="flex justify-between">
        <div><Text>Invite to community:</Text></div>
        <div>{{ communityName }}</div>
      </div>

      <template #footer>
        <div class="flex justify-center">
          <UButton color="white" label="Join" @click="join"/>
        </div>
      </template>
    </UCard>
  </UPage>
</template>
