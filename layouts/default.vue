<script setup lang="ts">
const { t } = useI18n()
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
      label: t("Task Area"),
      icon: "i-heroicons-plus",
      to: `/${slug}/tasks`,
    },
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

const communityList = [
  { title: "HelloRWA1", slug: "hellorwa1", avatar: "/logo.png" },
  { title: "HelloRWA2", slug: "hellorwa2", avatar: "/logo.png" },
  { title: "HelloRWA3", slug: "hellorwa3", avatar: "/logo.png" },
];
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="100" collapsible>
      <UDashboardSidebar>
        <template #header>
          <img src="/logo.png" class="h-full w-full" />
        </template>

        <UDivider />

        <NuxtLink :to="`/${slug}/tasks`" v-for="item in communityList" :key="item.slug">
          <img :src="item.avatar" :title="item.title" class="h-full w-full" />
        </NuxtLink>
        <div class="flex-1" />

        <UDivider class="bottom-0 sticky" />

        <template #footer>
          <UserDropdownMini />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>
    <!--    <UDashboardPanel :width="250" :resizable="{ min: 200, max: 300 }" collapsible>-->
    <!--      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">-->
    <!--        <template #left>-->
    <!--          <TeamsDropdown />-->
    <!--        </template>-->
    <!--      </UDashboardNavbar>-->

    <!--      <UDashboardSidebar>-->
    <!--        <template #header>-->
    <!--          <UDashboardSearchButton />-->
    <!--        </template>-->

    <!--        <UDashboardSidebarLinks :links="links" />-->

    <!--        <UDivider />-->

    <!--        <UDashboardSidebarLinks-->
    <!--          :links="[{ label: 'Colors', draggable: true, children: colors }]"-->
    <!--          @update:links="(colors) => (defaultColors = colors)"-->
    <!--        />-->

    <!--        <div class="flex-1" />-->

    <!--        <UDashboardSidebarLinks :links="footerLinks" />-->

    <!--        <UDivider class="bottom-0 sticky" />-->

    <!--        <template #footer>-->
    <!--          &lt;!&ndash; ~/components/UserDropdown.vue &ndash;&gt;-->
    <!--          <UserDropdown />-->
    <!--        </template>-->
    <!--      </UDashboardSidebar>-->
    <!--    </UDashboardPanel>-->

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
</template>
