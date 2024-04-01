<script setup lang="ts">
definePageMeta({
  layout: "wip",
});

import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const options = [
  { label: 'OKE', value: 'OKE' },
  { label: 'Binance', value: 'Binance' },
]

const state = reactive({
  input: undefined,
  inputMenu: undefined,
  Name: undefined,
  Inbro: undefined,
  Website: undefined,
  showWebsite: undefined,
  Twitter: undefined,
  showTwitter: undefined,
  Whitebook: undefined,
  showWhitebook: undefined,
  Buildernum: undefined,
  showBuildernum: undefined,
  Allreward: undefined,
  showAllreward: undefined,
  Typereward: undefined,
  showTypereward: undefined,
  showDetail: true,
  isPublished: undefined,
  TokenName: undefined,
  showTokenName: undefined,
  isTradable: undefined,
  TradePlatform: undefined,
})

const schema = z.object({
  Name: z.string().min(3),
  Inbro: z.string().min(5),
  
  TradePlatform: z.string().refine((value: string) => value === 'OKE', {
    message: 'Select OKE'
  }),
  Buildernum: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
})

type Schema = z.infer<typeof schema>

const form = ref()

async function onSubmit (event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}
</script>

<template>
  <div class="bg-red-900">
    create-community
    <UForm ref="form" :schema="schema" :state="state" class="space-y-4 p-5" @submit="onSubmit">
      <UFormGroup name="Logo" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">logo</div>
        </template>
        <UInput v-model="state.input" type="file" size="sm" />
      </UFormGroup>

      <UFormGroup name="Banner" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">banner</div>
        </template>
        <UInput v-model="state.inputMenu" type="file" size="sm" />
      </UFormGroup>

      <UFormGroup name="Name" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">社区名称</div>
        </template>
        <UInput v-model="state.Name" placeholder="Name" class="min-w-[100px] w-[430px]" />
      </UFormGroup>

      <UFormGroup name="Inbro" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">简介</div>
        </template>
        <UTextarea v-model="state.Inbro" placeholder="多行输入" class="min-w-[100px] w-[430px]" />
      </UFormGroup>

      <UFormGroup name="Website" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">官网</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Website" placeholder="URL" />
          <UToggle v-model="state.showWebsite" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <UFormGroup name="Twitter" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">Twitter</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Twitter" placeholder="URL" />
          <UToggle v-model="state.showTwitter" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <UFormGroup name="Whitebook" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">白皮书</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Whitebook" placeholder="URL" />
          <UToggle v-model="state.showWhitebook" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <UFormGroup name="Buildernum" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">Builder数量</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Buildernum" placeholder="150（无法编辑，自动生成）" />
          <UToggle v-model="state.showBuildernum" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <UFormGroup name="Allreward" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">奖励发放总量</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Allreward" placeholder="200U （无法编辑，自动生成—）" />
          <UToggle v-model="state.showAllreward" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <UFormGroup name="Typereward" class="flex flex-row items-center space-x-1">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">奖励发放类型</div>
        </template>
        <div class="flex flex-row items-center space-x-3">
          <UInput v-model="state.Typereward" placeholder="USDT PSN 多填" />
          <UToggle v-model="state.showTypereward" />
          <Text>显示</Text>
        </div>
      </UFormGroup>

      <div class="py-8 text-2xl">项目细节</div>

      <UFormGroup name="range" class="flex flex-row items-center space-x-10">
        <template #label>
          <div class="text-sky-400 min-w-[100px]">以下内容可以创建后填写</div>
        </template>
        全部隐藏
        <UToggle v-model="state.showDetail" />
        全部显示
      </UFormGroup>

      <div v-show="state.showDetail" class="ml-10 space-y-3">
        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class="text-sky-400 min-w-[150px]">Token是否已发行</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isPublished" />
            <Text>是</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="range" label="Range">
          <template #label>
            <div class="text-sky-400 min-w-[100px]">token 1 名称</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.TokenName" placeholder="" />
            <UToggle v-model="state.showTokenName" />
            <Text>显示</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class="text-sky-400 min-w-[150px]">Token是否可以交易</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isTradable" />
            <Text>是</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class="text-sky-400 min-w-[100px]">交易平台</div>
          </template>
          <USelect v-model="state.TradePlatform" placeholder="OKE" :options="options" />
        </UFormGroup>
      </div>

      <div class="py-8 text-2xl">经济模型</div>


      <UButton type="submit" class="ml-20">
        保存修改
      </UButton>
    </UForm>
  </div>
</template>
