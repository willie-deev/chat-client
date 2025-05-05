// types/useStomp.d.ts
import type { Ref } from 'vue'
import type { IMessage } from '@stomp/stompjs'

// 1️⃣ Augment the NuxtApp interface
declare module '#app' {
    interface NuxtApp {
        // This must match what your plugin provides:
        $useStomp: (opts?: {
            endpoint?: string
            headers?: Record<string, string>
            onError?: (err: any) => void
        }) => {
            connected: Ref<boolean>
            lastError: Ref<Error | null>
            subscribe: (
                destination: string,
                callback: (msg: IMessage) => void,
                headers?: Record<string,string>
            ) => { unsubscribe: () => void }
            publish: (
                destination: string,
                body: string | object,
                headers?: Record<string,string>
            ) => void
            disconnect: () => void
        }
    }
}
