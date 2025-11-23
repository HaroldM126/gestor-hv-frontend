import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

let redirecting401 = false

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const http = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
})

function isAuthPublicUrl(url?: string | null): boolean {
    if (!url) return false
    return url.includes('/auth/login') || url.includes('/auth/register')
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const auth = useAuthStore()
    // lee TODAS las variantes comunes de claves
    const token =
        auth.token ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('access_token') ||
        sessionStorage.getItem('accessToken')

    if (token && !isAuthPublicUrl(String(config.url || ''))) {
        config.headers = config.headers ?? {}
        // ⚠️ asegúrate de almacenar el JWT crudo (sin 'Bearer ' dentro)
        const raw = token.replace(/^Bearer\s+/i, '')
        config.headers.Authorization = `Bearer ${raw}`
    }

    // 🔎 DEBUG: inspecciona específicamente mi-perfil
    if (String(config.url || '').includes('/perfil/mi-perfil')) {
        const authHeader = (config.headers as any)?.Authorization
        console.debug('[HTTP] → /perfil/mi-perfil', {
            url: (config.baseURL || '') + config.url,
            hasAuthHeader: !!authHeader,
            authHeaderPreview: authHeader ? String(authHeader).slice(0, 24) + '…' : null,
        })
    }
    return config
})

http.interceptors.response.use(
    (res) => res,
    async (err: AxiosError<any>) => {
        const status = err?.response?.status

        // 🔎 DEBUG: loguea por qué falla mi-perfil
        const url = (err?.config?.baseURL || '') + (err?.config?.url || '')
        if (String(err?.config?.url || '').includes('/perfil/mi-perfil')) {
            console.warn('[HTTP] ← /perfil/mi-perfil', status, err?.response?.data)
        }

        if (!status) return Promise.reject(err)

        if (status === 401) {
            const name = router.currentRoute.value.name
            const inAuth = name === 'login' || name === 'register'
            if (!inAuth && !redirecting401) {
                redirecting401 = true
                const current = router.currentRoute.value.fullPath
                await router.replace({ name: 'login', query: { redirect: current } })
                redirecting401 = false
            }
            return Promise.reject(err)
        }

        if (status === 403) {
            if (router.currentRoute.value.name !== 'forbidden') {
                await router.replace({ name: 'forbidden' })
            }
            return Promise.reject(err)
        }

        return Promise.reject(err)
    }
)

export default http
