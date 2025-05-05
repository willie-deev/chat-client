// https://nuxt.com/docs/api/configuration/nuxt-config
import {UserScope} from "@logto/js";

export default defineNuxtConfig({
  modules: ['@logto/nuxt'],
  compatibilityDate: '2025-05-02',
  devtools: { enabled: false },
  // devServer: {
  //   port: 8080
  // },
  runtimeConfig: {
    public: {
      apiServer: process.env.NUXT_PUBLIC_API_SERVER
    },
    logto: {
      endpoint: process.env.NUXT_LOGTO_ENDPOINT,
      appId: process.env.NUXT_LOGTO_APP_ID,
      appSecret: process.env.NUXT_LOGTO_APP_SECRET,
      cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
      resources: JSON.parse(process.env.NUXT_LOGTO_RESOURCES!),
    },
  },
  logto: {
    postLogoutRedirectUri: '/',
    pathnames: {
      signIn: '/sign-in',
      signOut: '/sign-out',
      callback: '/callback',
    },
    scopes: [UserScope.Email],
    fetchUserInfo: true,
    // resources: ['http://localhost:3000'],
  },
  css: [
      '@picocss/pico/css/pico.min.css'
  ],
  vite: {
    define: {
      global: 'window'
    },
    resolve: {
      alias: {
        'sockjs-client$': 'sockjs-client/dist/sockjs.js'
      },
    },
  },
  plugins: [
    { src: '~/plugins/stomp.client.ts', mode: 'client'}
  ]
})
