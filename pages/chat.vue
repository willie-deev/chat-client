<script setup lang="ts">
  import dayjs from 'dayjs'
  import { useNuxtApp } from '#app'

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
  const messagesBox = ref<HTMLElement | null>(null)
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
      accessToken.value = await client.getAccessToken(config.logto.resources[0])
    } catch (error) {
      console.error('Failed to get user information:', error);
    }
  })
  function addMessage(author: string, content: string, timestamp: string){
    const sentMessage = document.createElement('article')
    sentMessage.className = 'message'
    const authorElement = document.createElement('em')
    authorElement.textContent = author + ":"
    authorElement.setAttribute('data-tooltip', dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss'))
    const contentElement = document.createElement('p')
    contentElement.textContent = content
    contentElement.style.paddingLeft = '1rem'
    sentMessage.appendChild(authorElement)
    sentMessage.appendChild(contentElement)
    messagesBox.value?.appendChild(sentMessage)
  }
  onMounted(async () => {
    try{
      const response = await $fetch(config.public.apiServer + '/api/addProfile', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      await reloadMessages()

      const { $useStomp } = useNuxtApp()
      const { connected, subscribe, publish, disconnect } = $useStomp({
        endpoint: 'http://localhost:3000/ws',
        headers: {
          Authorization: 'Bearer ' + accessToken.value
        },
        onError: err => console.error('STOMP error', err)
      })
      watch(connected, (ok) => {
        if (ok) {
          subscribe('/topic/notify', msg => {
            const parsedObject: any = JSON.parse(msg.body);
            addMessage(parsedObject.user_email, parsedObject.content, parsedObject.sendTime);
          });
        }
      })
    }catch(error){
      const loadingIcon = document.createElement('h1')
      loadingIcon.ariaBusy = 'true'
      loadingIcon.textContent = 'Loading...'
      loadingIcon.className = 'loading-icon'
      messagesBox.value?.appendChild(loadingIcon)
      console.error('Failed to get user information:', error);
    }
  })
  async function reloadMessages(){
    try{
      const messages: string = await $fetch(config.public.apiServer + '/api/getMessages', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      const parsedObject: any = JSON.parse(messages);
      const children = messagesBox.value?.children!;
      for (let i = children.length - 1; i >= 0; i--) {
        children[i].remove();
      }
      const dataArray = Object.entries(parsedObject).map(([timestamp, data]) => {
        const tmp = data as any;
        return {
          timestamp,
          user_email: tmp.user_email,
          content: tmp.content,
        };
      })
      const sortedData = [...dataArray].sort((a, b) => {
        const timestampA = parseInt(a.timestamp);
        const timestampB = parseInt(b.timestamp);

        return timestampA - timestampB;
      })
      for(const message of sortedData){
        addMessage(message.user_email, message.content, message.timestamp)
      }
      document.scrollingElement?.scrollTo(0, messagesBox.value!.scrollHeight)
    }catch(error){
      console.error('Failed to get user information:', error);
    }


  }
  async function sendMessage(){
    if(!inputMessage.value || inputMessage.value === ''){
      return
    }
    const requestData = { "content": inputMessage.value}
    const response = await $fetch(config.public.apiServer + '/api/sendMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      },
      body: requestData,
    })
    inputMessage.value = '';
    // await reloadMessages();
  }
</script>
<template>
  <nav class="fixed-nav">
    <a href="/sign-out" role="button" data-tooltip="LogOut" data-placement="bottom">LogOut</a>
    <h3 style="text-align: center;"><strong>Chat</strong></h3>
    <h6 style="text-align: right;">Your Account: <br>{{user.email}}</h6>
  </nav>
  <main class="scrollable-main">
    <div ref="messagesBox"></div>
  </main>
  <div class="fixed-bottom">
    <textarea placeholder="Type…" v-model="inputMessage" style="resize: none;"></textarea>
    <button @click="sendMessage">Send</button>
  </div>
</template>

<style>
  .loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .fixed-nav {
    position: fixed;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 1rem;
    background: #0a0c10;
    width: 100%;
    z-index: 1000;
  }

  .fixed-nav h3 {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: 0;
    transform: translate(-50%, -50%);
  }
  .fixed-nav a,
  .fixed-nav h6{
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
    padding-top: 6rem;
    padding-bottom: 8rem;
    overflow: auto;
  }
  .message {
    padding: 0.25rem;
    margin: 0.25rem;
    white-space: pre-wrap;
  }
</style>