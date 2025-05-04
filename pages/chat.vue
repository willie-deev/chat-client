<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
  })
  import {definePageMeta, useLogtoClient} from "#imports";
  import {useLogtoUserInfo} from "~/composables/states";

  const config = useRuntimeConfig()

  const client = useLogtoClient();
  const user = useLogtoUser();
  const userInfo = useLogtoUserInfo();
  const inputMessage = ref<string | null>('');
  const messages = ref<HTMLElement | null>(null)
  const accessToken = useState<string | null>('accessToken', () => null);
  await callOnce(async () => {
    try {
      if(!client){
        await navigateTo('/')
        return;
      }
      if(!(await client.isAuthenticated())){
        await navigateTo('/')
        return;
      }
      userInfo.value = await client.fetchUserInfo();
      accessToken.value = await client.getAccessToken(config.resourceServer)
      // console.log("userInfo.value.sub: ", userInfo.value.sub)
    } catch (error) {
      console.error('Failed to get user information:', error);
    }
  })
  onMounted(async () => {
    // console.log('userInfo.value in onMounted: ', userInfo.value)
    // console.log('accessToken.value in onMounted: ', accessToken.value)
    const response = await $fetch(config.public.apiServer + '/api/addProfile', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })
    console.log("addProfile response: ", response)
  })
  async function sendMessage(){
    if(!inputMessage.value || inputMessage.value === ''){
      return
    }
    if(!messages.value){
      return
    }
    const sentMessage = document.createElement('div')
    sentMessage.className = 'message'
    sentMessage.textContent = inputMessage.value
    messages.value?.appendChild(sentMessage)
    inputMessage.value = '';
  }
</script>
<template>
  <nav class="fixed-nav">
    <a href="/sign-out" role="button">LogOut</a>
    <h3><strong>Chat</strong></h3>
    <h6>Your Account: {{user.email}}</h6>
  </nav>
  <main class="scrollable-main">
    <div ref="messages"></div>
  </main>
  <div class="fixed-bottom">
    <textarea placeholder="Type…" v-model="inputMessage" style="resize: none;"></textarea>
    <button @click="sendMessage">Send</button>
  </div>
</template>

<style>
  .fixed-nav {
    position: fixed;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 1rem;
    background: #0a0c10;
    width: 100%;
  }

  .fixed-nav h3 {
    justify-self: center;
    margin: 0;
  }
  .fixed-nav a,
  .fixed-nav h6 {
    margin: 0;
  }

  .fixed-bottom {
    position: fixed;
    bottom: 0;
    left:0;
    width:100%;
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 0.5rem;
    background: #0a0c10;
  }
  .fixed-bottom input,
  .fixed-bottom button {
    margin: 0;
  }
  .scrollable-main {
    flex: 1;
    padding-top: 4rem;
    margin-bottom: 5rem;
    overflow: auto;
  }
  .message {
    padding: 0.25rem;
    margin: 0.25rem;
    white-space: pre-wrap;
  }
</style>