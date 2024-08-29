<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { tradePlatforms, tokenNames, maxCommunityLogoDimension } from '~/utils/constants'
import type { Community, CommunitySetting } from '~/types/index'
import { communitySettingSchema, validateCommunitySetting, type CommunitySettingSchema } from '~/utils/schemas'
import { arUrl, defaultCommunityLogo, getCommunityBannerUrl } from '~/utils/arAssets'
import { createUuid } from '~/utils'
import { useUpload } from '~/composables/useUpload'
import { inject } from 'vue'

const reloadCommunity = inject<Function>('reloadCommunity')

const props = defineProps<{
  isSettingMode?: boolean
  initState?: Community
}>()

const { address } = $(aoStore())

const { updateCommunity, addCommunity, makeCommunityChat } = $(communityStore())

const { upload, isUploading, uploadError, uploadResponse } = $(useUpload())

const { showSuccess, showError } = $(notificationStore())

const uploadInput = $ref<HTMLInputElement>()
async function upload2AR() {
  const file = uploadInput?.files?.[0]

  await upload({
    fileName: (props.initState?.uuid || createUuid()).slice(-4),
    pathName: 'communityLogo',
    file,
    maxWidth: maxCommunityLogoDimension.width,
    maxHeight: maxCommunityLogoDimension.height
  })

  if (uploadError || !uploadResponse) {
    showError('Failed to upload image.', uploadError)
    // clear file input
    if (uploadInput) {
      uploadInput.value = ''
    }
    return
  }

  formState.logo = uploadResponse.ARHash!
}

let createdCommunityID = $ref('')

const formState = reactive<CommunitySetting>({
  logo: defaultCommunityLogo,
  banner: 'banner6',
  name: '',
  desc: '',
  website: undefined,
  twitter: undefined,
  github: undefined,
  bountyTokenNames: [],
  isPublished: true,
  isTradable: false,
  tradePlatforms: [],
  allTokenSupply: undefined,
  /** community token allocation */
  tokenAllocations: [{
    name: '',
    supply: '' as unknown as number,
  }],
})

const form = ref()

async function onFormSubmit(event: FormSubmitEvent<CommunitySettingSchema>) {
  // Do something with event.data
  console.log('onCommunityFormSubmit: ', event.data)
  if (props.isSettingMode) {
    await setCommunity()
  } else {
    await createCommunity()
  }
}

const emit = defineEmits(['close-modal', 'saved'])

let showWaitingModal = $ref(false)
let disableSave = $ref(false)
let showSpinner = $ref(false)

const setCommunity = async () => {
  if (disableSave || !props.initState?.uuid) return
  disableSave = true
  showWaitingModal = true
  showSpinner = true
  try {
    if (!address) {
      throw new Error('Please connect wallet first.')
    }
    await updateCommunity(
      props.initState?.uuid,
      formState,
      communityTokens,
      address
    )
    emit('saved')
    reloadCommunity && await reloadCommunity()

    showSuccess('Successfully updated community.')
  } catch (error) {
    showError('Set community error:', error as Error)
    disableSave = false
    showWaitingModal = false
  } finally {
    showSpinner = false
  }
}

const createCommunity = async () => {
  if (disableSave) return
  disableSave = true
  showWaitingModal = true
  showSpinner = true
  try {
    const communityChatID = await makeCommunityChat()

    if (!communityChatID) {
      throw new Error('Failed to create community chatroom')
    }

    createdCommunityID = await addCommunity(
      formState,
      communityTokens,
      communityChatID
    )
    emit('saved')
  } catch (error) {
    console.error('Error creating community:', error)

    showWaitingModal = false
    disableSave = false
    showError('Failed to create community!', error as Error)
    return
  } finally {
    showSpinner = false
  }

}

const bannerItems = [
  'banner6',
  'banner7',
  'banner8',
  'banner9',
  'banner10',
]
const currentIndex = $ref(0) // 用于存储当前选中的索引

const updateBanner = (index: number) => {
  if (index === 1) {
    formState.banner = 'banner6'
  } else if (index === 2) {
    formState.banner = 'banner7'
  } else if (index === 3) {
    formState.banner = 'banner8'
  } else if (index === 4) {
    formState.banner = 'banner9'
  } else if (index === 5) {
    formState.banner = 'banner10'
  }
}

let communityTokens = $ref([{
  tokenName: '',
  // TODO remove showTokenName
  showTokenName: true
}])

// 添加表单组函数
const addCommunityTokenForm = () => {
  if (communityTokens.length < 2) {
    communityTokens.push({
      tokenName: '',
      showTokenName: true
    })
  } else {
    console.warn('Maximum of 2 community tokens allowed')
  }
}

// 移除表单组函数
const removeFormGroup = (index: any) => {
  communityTokens.splice(index, 1)
  if (!communityTokens.length) {
    formState.isPublished = false
  }
}

// 监听 state.isPublished 的变化
watch(() => formState.isPublished, (newVal) => {
  if (newVal) {
    if (communityTokens.length === 0) {
      addCommunityTokenForm()
    }
  } else {
    communityTokens = []
  }
})

// 添加表单组函数
const addSupplyGroup = () => {
  formState.tokenAllocations.push({
    name: '',
    supply: '' as unknown as number,
  })
}

// 移除表单组函数
const removeSupplyGroup = (index: number) => {
  formState.tokenAllocations.splice(index, 1)
  // 此处需要手动调用 validate，防止出现在删除有 error 的 tokenSupply 后，error 仍出现在页面上
  form.value.validate()
}

const setInitState = async (initState: Community) => {
  if (!initState) return

  console.log({ initState })

  formState.logo = initState.logo
  formState.banner = initState.banner
  formState.name = initState.name
  formState.desc = initState.desc
  formState.website = initState.website
  formState.twitter = initState.twitter
  formState.github = initState.github
  formState.bountyTokenNames = initState.bounty
  formState.isPublished = initState.ispublished
  communityTokens = initState.communitytoken
  formState.isTradable = initState.istradable
  formState.tradePlatforms = initState.support
  formState.allTokenSupply = initState.alltoken
  formState.tokenAllocations = initState.tokensupply
}

onMounted(async () => {
  if (props.initState) {
    await setInitState(props.initState)
  }
})
</script>

<template>
  <div class="overflow-y-auto pt-10 pb-6 px-6 md:px-16 w-fit">
    <UAlert
      icon="heroicons:user-group"
      :title="!props.isSettingMode ? $t('community.create') : $t('community.setting')"
      class="max-w-[75vw] w-full md:w-[580px]"
    >
      <template #description>
        <p v-if="!props.isSettingMode" v-html="$t('community.modalDescription', { lineBreak: '<br>' })" />
      </template>
    </UAlert>
    <UForm
      ref="form"
      :validate="validateCommunitySetting"
      :schema="communitySettingSchema"
      :state="formState"
      class="space-y-7 pt-10"
      @submit="onFormSubmit"
    >
      <UFormGroup required name="logo" :label="$t('Logo')">
        <div class="relative flex-center w-fit cursor-pointer ring-1 ring-gray-300 dark:ring-gray-700" @click="uploadInput && !isUploading && uploadInput.click()">
          <img
            v-if="formState.logo"
            :src="arUrl(formState.logo)"
            width="64"
            height="64"
            alt="logo"
          >
          <UButton
            v-if="!formState.logo"
            label="LOGO"
            size="xl"
            square
            variant="outline"
            class="flex justify-center w-16 h-16"
          />
          <input
            ref="uploadInput"
            type="file"
            class="opacity-0 w-0 h-0"
            accept="image/x-png,image/jpeg"
            @change="upload2AR"
          >

          <div v-if="isUploading" class="absolute left-0 top-0 flex-center bg-primary-200 bg-opacity-50 w-16 h-16"><UIcon name="svg-spinners:gooey-balls-2" class="w-8 h-8 text-white" /></div>
        </div>
      </UFormGroup>

      <UFormGroup required name="banner" :label="$t('community.banner')">
        <UCarousel
          v-model="currentIndex"
          :items="bannerItems"
          :ui="{
            item: 'basis-full',
            container: 'rounded-lg',
            indicators: {
              wrapper: 'relative bottom-0 mt-4'
            }
          }"
          indicators
          class="w-64"
        >
          <template #default="{ item }">
            <img :src="getCommunityBannerUrl(item)" class="w-full" draggable="false">
          </template>

          <template #indicator="{ onClick, page, active }">
            <UButton
              :label="String(page)"
              :variant="active ? 'solid' : 'outline'"
              size="2xs"
              class="rounded-full min-w-6 justify-center"
              @click="() => {
                currentIndex = page
                updateBanner(page)
                onClick(page)
              }"
            />
          </template>
        </UCarousel>
      </UFormGroup>

      <UFormGroup required name="name" :label="$t('community.name')">
        <UInput v-model.trim="formState.name" placeholder="Name" class="min-w-[100px] w-full" />
      </UFormGroup>

      <UFormGroup required name="desc" :label="$t('community.intro.label')">
        <UTextarea v-model.trim="formState.desc" :placeholder="`${$t('community.intro.placeholder')}`" class="min-w-[100px] w-full" />
      </UFormGroup>

      <div class="grid md:grid-cols-2 grid-cols-1 gap-7">
        <UFormGroup required name="typeReward" :label="$t('community.typereward')">
          <USelectMenu v-model="formState.bountyTokenNames" class="w-52 max-w-full mr-10" :options="tokenNames" multiple placeholder="Select Token" />
        </UFormGroup>

        <UFormGroup name="website">
          <template #label>
            <div>{{ $t('community.website') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model.trim="formState.website" placeholder="URL" class="w-52" />
          </div>
        </UFormGroup>

        <UFormGroup name="twitter">
          <template #label>
            <div>{{ $t('community.twitter') }}</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model.trim="formState.twitter" placeholder="URL" class="w-52" />
          </div>
        </UFormGroup>

        <UFormGroup name="github">
          <template #label>
            <div>Github</div>
          </template>
          <div class="flex flex-row items-center space-x-3">
            <UInput v-model.trim="formState.github" placeholder="URL" class="w-52" />
          </div>
        </UFormGroup>
      </div>

      <div class="!mt-12 !mb-8 font-bold text-xl text-left">{{ $t('community.project') }}</div>

      <UFormGroup :label="$t('community.token.release')" class="w-52 flex items-center justify-between relative" :ui="{container: 'mt-0'}">
        <div class="flex-center">
          <UToggle v-model="formState.isPublished" />
          <UPopover mode="hover" :popper="{ placement: 'right-end' }" class="flex-center ml-2 absolute left-9">
            <template #panel>
              <div class="px-3 py-2 flex justify-center">
                <ULink
                  to="https://noteforms.com/forms/decentramind-new-token-application-rtzsai"
                  active-class="text-primary"
                  target="_blank"
                  inactive-class="text-primary-500 dark:text-gray-400 hover:text-primary-700 dark:hover:text-gray-200"
                >
                  Add new tokens
                </ULink>
              </div>
            </template>
            <UIcon name="gravity-ui:circle-question" />
          </UPopover>
        </div>
      </UFormGroup>

      <div v-for="(formGroup, index) in communityTokens" :key="index" class="!mb-2 !mt-3">
        <UFormGroup :label="`Token ${index+1}`" :ui="{label: {base: 'font-medium'}, error: 'hidden'}">
          <div class="flex flex-row items-center gap-x-3">
            <USelect v-model="formGroup.tokenName" :options="tokenNames" />
            <UButton icon="material-symbols:close-rounded" variant="outline" @click="removeFormGroup(index)" />
            <UButton v-if="formState.isPublished && communityTokens.length<=1" variant="outline" icon="material-symbols:add" @click="addCommunityTokenForm" />
          </div>
        </UFormGroup>
      </div>

      <UFormGroup :label="$t('community.token.trade')" class="w-52 flex items-center justify-between space-x-10 !mt-8">
        <UToggle v-model="formState.isTradable" />
      </UFormGroup>

      <UFormGroup v-if="formState.isTradable" name="tradePlatform" :label="$t('community.token.platforms')" class="!mt-2" :ui="{label: {base: 'font-medium'}}">
        <USelectMenu v-model="formState.tradePlatforms" :options="tradePlatforms" multiple placeholder="Select trade platform" class="w-52" />
      </UFormGroup>

      <div class="!mt-12 !mb-8 font-bold text-xl text-left">{{ $t('community.economics') }}</div>


      <div class="space-y-3">
        <UFormGroup
          name="allToken"
          :label="$t('community.token.all')"
          class="mb-2"
        >
          <div class="flex flex-row items-center space-x-3">
            <UInput
              v-model.number="formState.allTokenSupply"
              type="number"
              placeholder=""
              class="w-52"
            />
          </div>
        </UFormGroup>

        <UFormGroup v-model="formState.tokenAllocations" name="tokenSupply">
          <UFormGroup
            v-for="(formGroup, index) in formState.tokenAllocations"
            :key="index"
            v-model="formState.tokenAllocations[index]"
            :name="`tokenSupply[${index}]`"
            class="mb-2"
            :ui="{error: 'hidden'}"
          >
            <div class="flex flex-row items-center space-x-3">
              <UInput
                v-model.trim="formGroup.name"
                placeholder="community"
                class="w-52"
              />
              <UInput
                v-model.number="formGroup.supply"
                type="number"
                placeholder="%"
                class="w-20"
              />
              <UButton v-if="formState.tokenAllocations.length > 1" icon="material-symbols:close-rounded" variant="outline" @click="removeSupplyGroup(index)" />

              <UButton v-if="index === formState.tokenAllocations.length - 1" variant="outline" icon="material-symbols:add" @click="addSupplyGroup" />
            </div>
          </UFormGroup>
        </UFormGroup>
      </div>

      <div class="flex-center !mt-12">
        <UButton color="white" type="submit" size="xl" :disabled="disableSave" :loading="showSpinner">
          {{ $t('Submit') }}
        </UButton>
      </div>
    </UForm>

    <UModal v-model="showWaitingModal" prevent-close>
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-center">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ props.isSettingMode ? $t("community.setting") : $t("community.create") }}
            </h3>
            <!--<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isCreated = false" />-->
          </div>
        </template>
        <UContainer v-if="showSpinner" class="w-full flex justify-around">
          <UIcon name="svg-spinners:6-dots-scale" />
        </UContainer>
        <UContainer v-else class="w-full flex justify-around">
          <UButton @click="!props.isSettingMode && $router.push(`/community/${createdCommunityID}`); emit('close-modal'); showWaitingModal = false">
            {{ $t('community.look') }}
          </UButton>
        </UContainer>
      </UCard>
    </UModal>
  </div>
</template>
