import {useLogtoClient} from "#imports";

export default defineNuxtRouteMiddleware((to, from) => {
    const user = useLogtoUser();
    if(!user) {
        return navigateTo('/');
    }
})