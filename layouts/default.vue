<script setup lang="ts">
import { provide } from 'vue'

const route = useRoute();
const appConfig = useAppConfig();
const { isHelpSlideoverOpen } = useDashboard();

const slug = $computed(() => route.params.slug);

const links = $computed(() => {
  return [
    {
      id: "home",
      label: "Home",
      icon: "i-heroicons-home",
      to: `/${slug}/`,
      tooltip: {
        text: "Home",
        shortcuts: ["G", "H"],
      },
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: "i-arcticons-x-twitter",
      to: `/${slug}/tasks`,
      badge: "4",
      tooltip: {
        text: "Inbox",
        shortcuts: ["G", "I"],
      },
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: "i-heroicons-inbox",
      to: `/${slug}/inbox`,
      badge: "4",
      tooltip: {
        text: "Inbox",
        shortcuts: ["G", "I"],
      },
    },
    {
      id: "users",
      label: "Users",
      icon: "i-heroicons-user-group",
      to: `/${slug}/users`,
      tooltip: {
        text: "Users",
        shortcuts: ["G", "U"],
      },
    },
    {
      id: "community-discovery",
      label: "Cmmunity-discovery",
      icon: "i-heroicons-user-group",
      to: `/${slug}/discovery`,
      tooltip: {
        text: "Community-discovery",
        shortcuts: ["G", "U"],
      },
    },
  ];
});
const footerLinks = $computed(() => {
  return [
    {
      label: "Invite people",
      icon: "i-heroicons-plus",
      to: `/${slug}/settings/communityinfo`,
    },
    {
      label: "Help & Support",
      icon: "i-heroicons-question-mark-circle",
      click: () => (isHelpSlideoverOpen.value = true),
    },
  ];
});

const groups = [
  {
    key: "links",
    label: "Go to",
    commands: links.map((link) => ({ ...link, shortcuts: link.tooltip?.shortcuts })),
  },
  {
    key: "code",
    label: "Code",
    commands: [
      {
        id: "source",
        label: "View page source",
        icon: "i-simple-icons-github",
        click: () => {
          window.open(`https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${route.path === "/" ? "/index" : route.path}.vue`, "_blank");
        },
      },
    ],
  },
];

const defaultColors = ref(
  ["green", "teal", "cyan", "sky", "blue", "indigo", "violet"].map((color) => ({
    label: color,
    chip: color,
    click: () => (appConfig.ui.primary = color),
  }))
);
const colors = computed(() => defaultColors.value.map((color) => ({ ...color, active: appConfig.ui.primary === color.label })));

const communityList1 = [
  { title: "HelloRWA1", slug: "hellorwa1", avatar: "/logo.png" },
  { title: "HelloRWA2", slug: "hellorwa2", avatar: "/logo.png" },
  { title: "HelloRWA3", slug: "hellorwa3", avatar: "/logo.png" },
];

const { getCommunityjoined } = $(aocommunityStore())

let createCommunity = $ref(false)

let communityLoading = $ref(true)

let communityList = $ref({})
let communityListJson = $ref({})
const getCommunity = async() => {
  
  communityList = await getCommunityjoined()
  const jsonData = communityList.Messages[0].Data; // 获取原始的 JSON 字符串
  const jsonObjects = jsonData.match(/\{.*?\}/g); // 使用正则表达式匹配字符串中的 JSON 对象
  communityListJson = jsonObjects.map((item: any) => JSON.parse(item)); // 解析每个 JSON 对象并存储到数组中

  communityLoading = false
}

onMounted(async () => {
  try {
    await getCommunity()
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

const handleCustomEvent = async() => {
  await getCommunity()
}

provide('updatecommunity', handleCustomEvent);
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="100" collapsible>
      <UDashboardSidebar>
        <template #header>
          <NuxtLink :to="`/${slug}/discovery`">
            <img src="/logo.png" class="h-full w-full" />
          </NuxtLink>
        </template>

        <UDivider />

        <NuxtLink :to="`/${slug}/community-details/${item.uuid}`" v-for="item in communityListJson" :key="item.uuid">
          <img src="/logo.png" :title="item.name" class="h-full w-full" />
        </NuxtLink>
        <UButton @click="createCommunity = true">
          <UIcon name="ion:add" class="h-full w-full" />
        </UButton>
        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <UserDropdownMini />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>
    <UDashboardPanel :width="250" :resizable="{ min: 200, max: 300 }" collapsible>
      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">
        <template #left>
          <TeamsDropdown />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <UDashboardSidebarLinks :links="links" />

        <UDivider />

        <UDashboardSidebarLinks
          :links="[{ label: 'Colors', draggable: true, children: colors }]"
          @update:links="(colors) => (defaultColors = colors)"
        />

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <!-- ~/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>

    <UModal v-model="createCommunity" prevent-close :width="1000">
      <UCard class="w-[1150px]">
        <CommunityCreate />
      </UCard>
    </UModal>
  </UDashboardLayout>
</template>
