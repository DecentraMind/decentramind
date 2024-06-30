<template>
  <div>
    <input type="file" @change="testAO">
  </div>
  <UBlogPost
    title="Nuxt 3.9"
    description="Nuxt 3.9 is out - a Christmas gift from the Nuxt team bringing Vite 5, interactive server components, new composables, a new loading API and more."
    date="Dec 25, 2023"
    orientation="vertical"
    :image="{ src: imgSrc, alt: 'Nuxt 3.9' }"
    :authors="[{ name: 'Daniel Roe', avatar: { src: 'https://github.com/danielroe.png', target: '_blank' }, to: 'https://twitter.com/danielcroe' }]"
    :badge="{ label: 'Release' }"
  />
</template>

<script setup lang="ts">

import { createClient } from '@supabase/supabase-js'
import { decode } from 'base64-arraybuffer'
// Create a single supabase client for interacting with your database
const supabase = createClient('https://rieleneltfiksbhrgpiw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWxlbmVsdGZpa3NiaHJncGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzMDkzOTAsImV4cCI6MjAzMDg4NTM5MH0.SYSVYvSDYn5TeFc1wJC_7tVjIiIsH1GqvAd22Fpc0Ic')
let imgSrc = $ref('')


async function testAO(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const base64Data = e.target.result.split(',')[1];
    console.log('Base64 encoded file content:');
    console.log(base64Data);
    const {data, error} = await supabase
      .storage
      .from('dm-mvp')
      .upload('communityAvatar/avatar4.jpg', decode(base64Data), {
        contentType: 'image/jpg'
      })
    console.log('fullPath = ' + data.fullPath)
    imgSrc = imgSrc + 'https://rieleneltfiksbhrgpiw.supabase.co/storage/v1/object/public/' + data.fullPath
    console.log('imgSrc = ' + imgSrc)
    console.log('error = ' + JSON.stringify(error))
  };

  reader.readAsDataURL(file);
  // console.log('value = ' + value)

}
</script>
