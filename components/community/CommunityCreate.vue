<script setup lang="ts">


import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'


const options = [
  { label: 'OKE', value: 'OKE' },
  { label: 'Binance', value: 'Binance' },
]
const supportSelect = ['ArSwap', 'Permaswap', 'Binance', 'Coinbase']
const supportSelected = $ref([])
const tokenselect = ['AR', 'TRUNK', 'EXP', 'Orbit', 'Earth', 'Fire', 'Air', 'Lava']
const tokenselected = $ref([])
let isCreated = $ref(false)

let state = $ref({
  logobase64Data: undefined,
  banner: 'banner6',
  input: undefined,
  inputMenu: undefined,
  Name: undefined,
  Inbro: undefined,
  Website: undefined,
  Twitter: undefined,
  Github: undefined,
  Buildernum: undefined,
  Allreward: undefined,
  Typereward: undefined,
  isPublished: true,
  TokenName: undefined,
  showTokenName: false,
  isTradable: undefined,
  TradePlatform: undefined,
  Alltoken: undefined,
  Communitytoken: undefined,
  communityChatid: undefined,
})

const schema = z.object({
  Alltoken: z.string()
    .min(0, { message: 'Must be more than 0' })
    .refine((value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    }, { message: 'Must be a valid number more than 0' })
    .refine((value: string) => {
      const regex = /^\d+(\.\d{1,3})?$/;
      return regex.test(value);
    }, { message: 'Must be a valid number with up to 3 decimal places' }),
  Name: z.string().min(2).max(20),
  Inbro: z.string().min(3).max(100),

  //Website: z.string().max(20).optional(),
  //Twitter: z.string().max(20).optional(),
  //Gihub: z.string().max(20).optional(),

  TradePlatform: z.string().refine((value: string) => value === 'OKE', {
    message: 'Select OKE'
  }),

  /*
  Allreward: z.string().max(100, { message: 'Must be less than 20' }).refine((value: string) => {
    const num = parseInt(value)
    return !isNaN(num) && num <= 100
  }, { message: 'Must be a valid number less than or equal to 20' }),
  */
})

type Schema = z.infer<typeof schema>

const form = ref()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}


const { addCommunity, communityCreate, getCommunitylist, makecommunityChat } = $(aocommunityStore())
let createCommunity = $ref('')
let isLoading = $ref(false)
let createSuccess = $ref(false)
const CreateCommunity = async () => {
  if (isLoading) return
  isLoading = true
  isCreated = true
  try {
    state.communityChatid = await makecommunityChat();

    if (!state.communityChatid) {
      throw new Error('Failed to create community chat');
    }

    let communitySubmit = [
      {
        name: state.Name,
        desc: state.Inbro,
        website: state.Website,
        allreward: state.Allreward,
      }
    ];
    const jsonString = JSON.stringify(communitySubmit);

    createCommunity = await addCommunity(
      state.logobase64Data,
      state.banner,
      state.Name,
      state.Inbro,
      state.Website,
      state.Twitter,
      state.Github,
      tokenselected, // 选择的token类型
      state.isPublished, // 是否有发行token
      token.communityToken, // 社区token分配比例额度
      state.isTradable, // 是否可以交易
      supportSelected, // 交易得平台
      state.Alltoken, // 分配得token总量
      token.tokenSupply, // 社区token分配比例详情
      state.communityChatid
    );
    createSuccess = true
    isCreated = true;
  } catch (error) {
    console.error('Error creating community:', error.message);
    isCreated = false
    alert('Failed to create community!')
    // 这里可以添加更多的错误处理逻辑，例如显示错误消息给用户
  } finally {
    isLoading = false;
    createSuccess = true
  }
  createSuccess = true
  isCreated = true
  isLoading = false
}


const handleUp = (event) => {
  const file = event.target?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= 400 && img.height <= 400 && img.width === img.height) {
          state.logobase64Data = e.target.result;
        } else {
          alert('Image dimensions should be square and both dimensions should be less than or equal to 400px.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const logoupload = () => {
  const input = document.querySelector('#logoupload') as any
  input.click()
}

const bannerupload = () => {
  const input = document.querySelector('#bannerupload') as any
  input.click()
}


const items = [
  '/task/banner6.jpg',
  '/task/banner7.jpg',
  '/task/banner8.jpg',
  '/task/banner9.jpg',
  '/task/banner10.jpg',
]
const currentIndex = $ref(0); // 用于存储当前选中的索引

const updateBanner = (index: number) => {
  if (index === 1) {
    state.banner = 'banner6'
  } else if (index === 2) {
    state.banner = 'banner7'
  } else if (index === 3) {
    state.banner = 'banner8'
  } else if (index === 4) {
    state.banner = 'banner9'
  } else if (index === 5) {
    state.banner = 'banner10'
  }
};
const test = ()=> {
  //console.log(token.communityToken)
}

// 初始化表单组状态数组
const token = $ref({
  communityToken: [
    {
      tokenName: '',
      showTokenName: true
    }
  ],
  tokenSupply: [
    {
      name: '',
      supply: '',
    }
  ]
})

// 添加表单组函数
const addFormGroup = () => {
  if (token.communityToken.length < 2) {
    token.communityToken.push({
      tokenName: '',
      showTokenName: true
    });
  } else {
    console.warn('Maximum of 2 community tokens allowed');
  }
}

// 移除表单组函数
const removeFormGroup = (index: any) => {
  token.communityToken.splice(index, 1)
}

// 监听 state.isPublished 的变化
watch(() => state.isPublished, (newVal) => {
  if (newVal) {
    if (token.communityToken.length === 0) {
      addFormGroup()
    }
  } else {
    token.communityToken = []
  }
})



// 添加表单组函数
const addSupplyGroup = () => {
  token.tokenSupply.push({
    name: '',
    supply: '',
  })
}

// 移除表单组函数
const removeSupplyGroup = (index) => {
  token.tokenSupply.splice(index, 1)
}

let settingInfo = $ref(true)


</script>

<template>
  <UDashboardPage>
    <DashboardPanelContent class="w-full overflow-y-auto pl-20 pt-10">
      <UAlert>
        <template #title>
          <div class="text-3xl p-2 flex justify-center">{{ $t('community.create') }}</div>
        </template>
      </UAlert>
      <UForm ref="form" :schema="schema" :state="state" class="space-y-4 p-5 pl-20 pt-10" @submit="onSubmit">
        <!--
        <div>
          <UButton @click="settingInfo = true">基础信息设置</UButton>
          <UButton @click="settingInfo = false">功能设置</UButton>
        </div>
        -->
        <UFormGroup name="Logo" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.logo') }}</div>
          </template>
          <UButton label="LOGO" size="xl" square variant="outline" class="flex justify-center w-[150px] h-[120px]" @click="logoupload" />
          <Input id="logoupload" type="file" size="sm" class="opacity-0" @change="handleUp" />
        </UFormGroup>

        <UFormGroup name="Banner" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.banner') }}</div>
          </template>
          <UCarousel
            v-model="currentIndex"
            :items="items"
            :ui="{
              item: 'basis-full',
              container: 'rounded-lg',
              indicators: {
                wrapper: 'relative bottom-0 mt-4'
              }
            }"
            indicators
            class="w-64 mx-auto"
          >
            <template #default="{ item }">
              <img :src="item" class="w-full" draggable="false">
            </template>

            <template #indicator="{ onClick, page, active }">
              <UButton
                :label="String(page)"
                :variant="active ? 'solid' : 'outline'"
                size="2xs"
                class="rounded-full min-w-6 justify-center"
                @click="() => {
                  currentIndex = page; // 更新当前索引
                  updateBanner(page)
                  onClick(page); // 触发页面点击事件
                }"
              />
            </template>
          </UCarousel>
        </UFormGroup>

        <UFormGroup name="Name" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.name') }}</div>
          </template>
          <UInput v-model="state.Name" placeholder="Name" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Inbro" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.intro') }}</div>
          </template>
          <UTextarea v-model="state.Inbro" :placeholder="`${$t('community.intro.label')}`" class="min-w-[100px] w-[430px]" />
        </UFormGroup>

        <UFormGroup name="Website" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class="w-[300px]">{{ $t('community.website') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Website" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Twitter" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.twitter') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Twitter" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Github" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">Github</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model="state.Github" placeholder="URL" />
          </div>
        </UFormGroup>

        <UFormGroup name="Typereward" class="flex flex-row items-center space-x-1">
          <template #label>
            <div class=" w-[300px]">{{ $t('community.typereward') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <USelectMenu v-model="tokenselected" class="w-[130px] mr-10" :options="tokenselect" multiple placeholder="Select Token" />
          </div>
        </UFormGroup>

        <div class="py-8 text-2xl">{{ $t('community.project') }}</div>

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[450px]">{{ $t('community.token.release') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isPublished" />
            <Text>{{ state.isPublished ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>

        <div v-for="(formGroup, index) in token.communityToken" :key="index">
          <UFormGroup name="range" label="Range">
            <template #label>
              <div class=" min-w-[100px]">{{ index+1 }}st Token</div>
            </template>
            <div class="flex flex-row items-center space-x-3">
              <div class="flex min-w-[477px]">
                <USelect v-model="formGroup.tokenName" :options="tokenselect" />

                <UButton icon="material-symbols:close-rounded" variant="outline" class="ml-3" @click="removeFormGroup(index)"/>
              </div>
              <UPopover mode="hover" :popper="{ placement: 'right-end' }">
                <template #panel>
                  <div class="w-full w-[160px] h-[25px] flex justify-center">
                    <ULink
                      to="https://forms.gle/RwWbeFphvyi8ZEU9A"
                      active-class="text-primary"
                      target="_blank"
                      inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Add new tokens
                    </ULink>
                  </div>
                </template>
                <UIcon name="gravity-ui:circle-question" />
              </UPopover>
            </div>
          </UFormGroup>
        </div>
        <UButton v-if="state.isPublished" variant="outline" icon="material-symbols:add" @click="addFormGroup" />

        <UFormGroup name="range" class="flex flex-row items-center space-x-10">
          <template #label>
            <div class=" min-w-[452px]">{{ $t('community.token.trade') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UToggle v-model="state.isTradable" />
            <Text>{{ state.isTradable ? $t('yes') : $t('no') }}</Text>
          </div>
        </UFormGroup>
        <div v-if="state.isTradable">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class=" min-w-[270px]">{{ $t('community.token.platforms') }}</div>
            </template>
            <USelectMenu v-model="supportSelected" :options="supportSelect" multiple placeholder="Select" />
          </UFormGroup>
        </div>

        <div class="py-8 text-2xl">{{ $t('community.economics') }}</div>


        <div class="space-y-3">
          <UFormGroup name="range" class="flex flex-row items-center space-x-10">
            <template #label>
              <div class=" min-w-[410px]">{{ $t('community.token.all') }}</div>
            </template>
          </UFormGroup>
          <UFormGroup name="Alltoken" class="mb-2">
            <div class="flex flex-row items-center space-x-3">
              <UInput v-model="state.Alltoken" placeholder="" class="w-[120px]" />
            </div>
          </UFormGroup>

          <div v-for="(formGroup, index) in token.tokenSupply" :key="index">
            <UFormGroup name="range" class="mb-2">
              <div class="flex flex-row items-center space-x-3">
                <UInput v-model="formGroup.name" placeholder="community" />
                <UInput v-model="formGroup.supply" placeholder="%" class="w-[50px]" />
                <UButton icon="material-symbols:close-rounded" variant="outline" @click="removeSupplyGroup(index)" />
              </div>
            </UFormGroup>
          </div>

          <UButton variant="outline" icon="material-symbols:add" @click="addSupplyGroup" />
        </div>


        <div class="flex justify-center">
          <UButton color="white" type="submit" size="xl" @click="CreateCommunity">
            {{ $t('add') }}
          </UButton>
        </div>
      </UForm>
      <!--
      <UModal v-model="isCreated" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Modal
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreated = false" />
            </div>
          </template>
          <UContainer class="w-full flex justify-around">
            <UButton :to="`/${slug}/create-community`">{{ $t('community.continue') }}</UButton>
            <UButton :to="`/${slug}/discovery`" @click="communityCreate = false; isCreated = false">{{$t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
      -->
      <UModal v-model="isCreated" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-center">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Create Community
              </h3>
              <!--<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreated = false" />-->
            </div>
          </template>
          <UContainer v-if="!createSuccess" class="w-full flex justify-around">
            <UIcon name="svg-spinners:6-dots-scale" />
          </UContainer>
          <UContainer v-else class="w-full flex justify-around">
            <UButton :to="`/${slug}/discovery`" @click="getCommunitylist(); communityCreate = false; isCreated = false">{{$t('community.look') }}
            </UButton>
          </UContainer>
        </UCard>
      </UModal>
    </DashboardPanelContent>
  </UDashboardPage>
</template>
