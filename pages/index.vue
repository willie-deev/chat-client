<script setup lang="ts">
import {useLogtoClient} from "#imports";
  const client = useLogtoClient();
  let authorized = false
  await callOnce(async () => {
    if(!client){
      return;
    }
    if(!(await client.isAuthenticated())){
      return;
    }
    authorized = true;
  })
  if(authorized){
    await navigateTo('/chat')
  }
</script>
<template>
  <main class="container">
    <article>
      <hgroup>
        <h1>E</h1>
      </hgroup>
      <p>Chat website by willie-deev</p>
      <a role="button" href="/sign-in">sign in</a>
    </article>
  </main>
</template>
