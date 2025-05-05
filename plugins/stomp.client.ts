// plugins/stomp.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import {Client, type Frame, type IMessage, Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';


export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    function useStomp(options: {
        endpoint: string
        headers?: Record<string,string>
        onError?: (err: any) => void
    }) {
        const connected = ref(false)
        const lastError = ref<Error|null>(null)
        const endpoint = options.endpoint
        const socket = new SockJS(endpoint);
        const stompClient = Stomp.over(socket);
        stompClient.debug = function (msg){
            // do nothing
        }
        stompClient.connect(
            options.headers,
            (_frame: Frame) => {
                connected.value = true;
            },
            (evt: Error) => {
                lastError.value = evt
            },
            () => {
                connected.value = false;
            }
        )


        // Composable API
        function subscribe(
            destination: string,
            callback: (msg: IMessage) => void,
            headers?: Record<string,string>
        ) {
            return stompClient.subscribe(destination, callback, headers)
        }

        function publish(
            destination: string,
            body: string|object,
            headers?: Record<string,string>
        ) {
            const payload = typeof body === 'string' ? body : JSON.stringify(body)
            stompClient.publish({ destination, body: payload, headers })
        }

        function disconnect() {
            stompClient.deactivate()
        }

        return { connected, lastError, subscribe, publish, disconnect }
    }

    // nuxtApp.provide('useStomp', useStomp)
    return {
        provide: {
            useStomp
        }
    }
})