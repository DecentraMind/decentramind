<script setup lang="ts">
import RuleModal from '~/components/RuleModal.vue'
import CommonAlert from '~/components/CommonAlert.vue'

definePageMeta({
  layout: "wip",
});
const toast = useToast()
const modal = useModal()

const blogpost = {
  userId: 1,
  userName: "gqz",
  userTwitter: "xx",
};
const error_msg = "感谢你对社区的支持~经系统检测，你还没有绑定twitter账号哦！"
function openModal () {
  if(isNullOrEmpty(blogpost.userTwitter)){
    modal.open(CommonAlert, {message: error_msg})
  }else{
    modal.open(RuleModal)
  }
}
function isNullOrEmpty(str: string | null | undefined): boolean {
  return !str || str.length === 0 || str.length == undefined;
}
</script>

<template>
<!--  <div class="bg-red-400">discovery</div>-->
  <UButton label="Reveal modal" @click="openModal" />
</template>
