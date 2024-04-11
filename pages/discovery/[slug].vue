<script setup lang="ts">
import { withoutTrailingSlash, joinURL } from "ufo";
import type { BlogPost } from "~/types";

const route = useRoute();

const { data: post } = await useAsyncData(route.path, () => queryContent<BlogPost>(route.path).findOne());
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: "Post not found", fatal: true });
}

const { data: surround } = await useAsyncData(
  `${route.path}-surround`,
  () =>
    queryContent("/discovery")
      .where({ _extension: "md" })
      .without(["body", "excerpt"])
      .sort({ date: -1 })
      .findSurround(withoutTrailingSlash(route.path)),
  { default: () => [] }
);

const title = post.value.head?.title || post.value.title;
const description = post.value.head?.description || post.value.description;
const logo = post.value.head?.logo || post.value.logo;

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
});

if (post.value.image?.src) {
  const site = useSiteConfig();

  useSeoMeta({
    ogImage: joinURL(site.url, post.value.image.src),
    twitterImage: joinURL(site.url, post.value.image.src),
  });
} else {
  defineOgImage({
    component: "Saas",
    title,
    description,
    headline: "Discovery",
  });
}
</script>

<template>
  <UContainer v-if="post">
    <UPageHeader class="mt-10" :title="post.title" :description="post.description">
      <template #icon>
        <img :src="logo" class="rounded-full h-40 w-40 inline-flex" />
      </template>

      <template #headline>
        <UBadge v-bind="post.badge" variant="subtle" />
        <span class="text-gray-500 dark:text-gray-400">&middot;</span>
        <time class="text-gray-500 dark:text-gray-400">{{
          new Date(post.date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })
        }}</time>
      </template>

      <div class="flex flex-wrap mt-4 gap-3 items-center">
        <UButton to="https://dmind.space" target="_blank" icon="i-mdi-web" aria-label="X" color="gray" variant="ghost"> Website </UButton>
        <UButton to="https://twitter.com/decentramindio" target="_blank" icon="i-simple-icons-twitter" aria-label="X" color="gray" variant="ghost">
          Decentralmindio
        </UButton>
        <UButton to="https://twitter.com/decentramindio" target="_blank" icon="i-simple-icons-github" aria-label="X" color="gray" variant="ghost">
          Github
        </UButton>
        <UButton to="https://twitter.com/decentramindio" target="_blank" icon="i-simple-icons-discord" aria-label="X" color="gray" variant="ghost">
          Discord
        </UButton>
        <UButton to="https://twitter.com/decentramindio" target="_blank" icon="i-simple-icons-telegram" aria-label="X" color="gray" variant="ghost">
          Telegram
        </UButton>
      </div>
      <template #links>
        <UButton size="xl" icon="i-heroicons-arrow-right-20-solid">Go to Space</UButton>
      </template>
    </UPageHeader>

    <UPage>
      <UPageBody prose>
        <ContentRenderer v-if="post && post.body" :value="post" />

        <hr v-if="surround?.length" />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template #right>
        <UContentToc v-if="post.body && post.body.toc" :links="post.body.toc.links" />
      </template>
    </UPage>
  </UContainer>
</template>
