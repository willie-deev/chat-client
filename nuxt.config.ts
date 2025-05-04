// https://nuxt.com/docs/api/configuration/nuxt-config
import {UserScope} from "@logto/js";

export default defineNuxtConfig({
  modules: ['@logto/nuxt'],
  compatibilityDate: '2025-05-02',
  devtools: { enabled: true },
  devServer: {
    port: 8080
  },
  runtimeConfig: {
    resourceServer: process.env.RESOURCE_SERVER,
    public: {
      apiServer: process.env.API_SERVER
    },
    logto: {
      endpoint: 'https://70j3dm.logto.app/',
      appId: 'aychojwz0epxl9ur550b8',
      appSecret: '8FGEvFPqedku79DzzhF4FkQkaKqKgy1n',
      cookieEncryptionKey: '5R6dbpNPKHAebwAiQzFb0uxFkOVVtWew', // Random-generated
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
    resources: ['http://localhost:3000'],
  },
  css: [
      '@picocss/pico/css/pico.min.css'
  ]
})
