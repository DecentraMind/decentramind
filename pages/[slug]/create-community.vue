<script setup lang="ts">


import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const options = [
  { label: 'OKE', value: 'OKE' },
  { label: 'Binance', value: 'Binance' },
]

let isCreateed = $ref(false)

let state = $ref({
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
  showDetail: false,
  isPublished: undefined,
  TokenName: undefined,
  showTokenName: undefined,
  isTradable: undefined,
  TradePlatform: undefined,
  showAlltoken: undefined,
  Alltoken: undefined,
  Communitytoken: undefined,
  Teamtoken: undefined,
  Flowtoken: undefined,
})

const schema = z.object({
  Name: z.string().min(2),
  Inbro: z.string().min(3),
  
  TradePlatform: z.string().refine((value: string) => value === 'OKE', {
    message: 'Select OKE'
  }),
  Allreward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
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


const { addCommunity } = $(aocommunityStore())
let createCommunity = $ref('')
let isLoading = $ref(false)

const CreateCommunity = async () => { 
  if (isLoading) return
  isLoading = true

  let communitySubmit = [
    {
      "name": state.Name,
      "desc": state.Inbro,
      "website": state.Website,
      "whitebook": state.Whitebook,
      "allreward": state.Allreward,
    }
  ]
  const jsonString = JSON.stringify(communitySubmit);
  
  createCommunity = await addCommunity(state.Name, state.Inbro, state.Twitter, state.Website, state.Whitebook, state.Allreward)
  isCreateed = true
  isLoading = false
}


const handleUp = async (value: any) => {
  console.log("goods")
}

const logoupload = () => {
  const input = document.querySelector('#logoupload') as any
  console.log(state.input)
  input.click()
  console.log(state.input)
}
const bannerupload = () => {
  const input = document.querySelector('#bannerupload') as any
  input.click()
}


</script>

<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto pl-20 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl p-2">{{ $t('community.create')}}</div>
        </template>
      </UAlert>
      <UForm ref="form" :schema="schema" :state="state" class="space-y-4 p-5 pl-20 pt-10" @submit="onSubmit">
        <UFormGroup name="Logo" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.logo')}}</div>
          </template>
          <UButton 
            label="LOGO"
            size="xl"
            square
            variant="outline" 
            class="flex justify-center w-[150px] h-[120px]"
            @click="logoupload" 
          />
          <UInput 
            id="logoupload" 
            v-model="state.input" 
            type="file" 
            size="sm" 
            class="opacity-0" 
            @change="handleUp"
          />
        </UFormGroup>

        <UFormGroup name="Banner" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.banner')}}</div>
          </template>
          <UButton
            :label="`${$t('community.banner.submit')}`"
            size="xl"
            square
            variant="outline" 
            class="flex justify-center w-[420px] h-[80px]"
            @click="bannerupload" 
          />
          <UInput 
            id="bannerupload" 
            v-model="state.inputMenu" 
            type="file" 
            size="sm" 
            class="opacity-0" 
            @change="handleUp"
          />
        </UFormGroup>

        <UFormGroup name="Name" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.name')}}</div>
          </template>
          <UInput v-model="state.Name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Inbro" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.intro')}}</div>
          </template>
          <UTextarea v-model="state.Inbro" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Website" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.website')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Website" placeholder="URL" />
            <UToggle v-model="state.showWebsite" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Twitter" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.twitter')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Twitter" placeholder="URL" />
            <UToggle v-model="state.showTwitter" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Whitebook" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.whitebook')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Whitebook" placeholder="URL" />
            <UToggle v-model="state.showWhitebook" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Buildernum" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.buildnum')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Buildernum" :placeholder="`${$t('community.buildnum.label')}`" />
            <UToggle v-model="state.showBuildernum" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Allreward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.allreward')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Allreward" :placeholder="`${$t('community.buildnum.label')}`" />
            <UToggle v-model="state.showAllreward" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <UFormGroup name="Typereward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="text-sky-400 w-[300px]">{{ $t('community.typereward')}}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Typereward" :placeholder="`${$t('community.buildnum.label')}`" />
            <UToggle v-model="state.showTypereward" />
            <Text>{{ $t('show')}}</Text>
          </div>
        </UFormGroup>

        <div class="py-8 text-2xl">{{ $t('community.project')}}</div>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class="text-sky-400 min-w-[100px]">{{ $t('community.after')}}</div>
          </template>
          {{ $t('hideall')}}
          <UToggle v-model="state.showDetail" />
          {{ $t('showall')}}
        </UFormGroup>

        <div v-show="state.showDetail" class="ml-10 space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[150px]">{{ $t('community.token.release')}}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UToggle v-model="state.isPublished" />
              <Text>{{ $t('yes')}}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" label="Range">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.name')}}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UInput v-model="state.TokenName" placeholder="" />
              <UToggle v-model="state.showTokenName" />
              <Text>{{ $t('show')}}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[150px]">{{ $t('community.token.trade')}}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <UToggle v-model="state.isTradable" />
              <Text>{{ $t('yes')}}</Text>
            </div>
          </UFormGroup>

          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.platforms')}}</div>
            </template>
            <USelect v-model="state.TradePlatform" placeholder="OKE" :options="options" />
          </UFormGroup>
        </div>

        <div class="py-8 text-2xl">{{ $t('community.economics')}}</div>


        <div class="ml-10 space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class="text-sky-400 min-w-[100px]">{{ $t('community.token.all')}}</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <Text>{{ $t('hide')}}</Text>
              <UToggle v-model="state.showAlltoken" />
              <Text>{{ $t('show')}}</Text>
            </div>
          </UFormGroup>
          <div v-show="state.showAlltoken">
            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Alltoken" placeholder="" />
              </div>
            </UFormGroup>

            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Communitytoken" placeholder="community" />%
              </div>
            </UFormGroup>

            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Teamtoken" placeholder="team" />%
              </div>
            </UFormGroup>

            <UFormGroup name="range">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="state.Flowtoken" placeholder="liquidity" />%
              </div>
            </UFormGroup>
          </div>
        </div>

        <UButton type="submit" class="ml-20" @click="CreateCommunity">
          {{ $t('add')}}
        </UButton>
      </UForm>
      <UModal v-model="isCreateed" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modal
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreateed = false" />
            </div>
          </template>
          <UContainer class="w-full flex justify-around">
            <UButton :to="`/${slug}/create-community`">{{ $t('community.continue')}}</UButton>
            <UButton :to="`/${slug}/discovery`">{{ $t('community.look')}}</UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
