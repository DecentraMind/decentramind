<script setup lang="ts">

definePageMeta({
  layout: "wip",
});
const route = useRoute()
const communityName = $computed(() => route.params.communityName)
// const { getLocalcommunityInfo, setCurrentuuid } = $(aocommunityStore())
//
// let communityInfo = $ref({})
// const loadCommunityInfo = async (pid) => {
//   try {
//     communityInfo = await getLocalcommunityInfo(pid)
//   } catch (error) {
//     console.error('Error fetching data:', error)
//   }
// }

// onMounted(async () => {
//   setCurrentuuid(communityId)
//   await loadCommunityInfo(communityId)
// })
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
          <UButton color="white" label="Join" to="http://localhost:3000"/>
        </div>
      </template>
    </UCard>
  </UPage>
</template>
