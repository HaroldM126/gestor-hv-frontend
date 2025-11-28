import { defineStore } from 'pinia'
import type { LoginResponse, RegisterPayload, User } from '@/types/auth'
import { http } from '@/lib/http'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        loading: false as boolean,
        user: (JSON.parse(localStorage.getItem('user') || 'null') as User | null),
        token: (localStorage.getItem('access_token') || null) as string | null,
    }),

    getters: {
        isAuthenticated: (s) => !!s.token,
        role: (s) => s.user?.rol,
    },

    actions: {
        async hydrateFromStorage() {
    if (!this.token) return null

    try {
        const { data } = await http.get<User>('/auth/me')
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
    } catch (e) {
        this.logout(true)
    }
},

        async login(usuario: string, password: string) {
            this.loading = true
            try {
                const body = { usuario: usuario.trim().toLowerCase(), password }
                const { data } = await http.post<LoginResponse>('/auth/login', body)
                console.log("ROL EN LOGIN:", data.user.rol)
                this.token = data.access_token
                this.user = data.user
                localStorage.setItem('access_token', data.access_token)
                localStorage.setItem('user', JSON.stringify(data.user))
            } finally {
                this.loading = false
            }
        },

        async register(payload: RegisterPayload) {
            this.loading = true
            try {
                const body = { ...payload, usuario: payload.usuario.trim().toLowerCase() }
                const { data } = await http.post<LoginResponse & { message: string }>('/auth/register', body)
                this.token = data.access_token
                this.user = data.user
                localStorage.setItem('access_token', data.access_token)
                localStorage.setItem('user', JSON.stringify(data.user))
                return data.message
            } finally {
                this.loading = false
            }
        },

        async fetchMe() {
            if (!this.token) return null
            const { data } = await http.get<User>('/auth/me')
            console.log("ME RESPONSE:", data)
            this.user = data
            localStorage.setItem('user', JSON.stringify(data))
            return data
        },

        logout(silent = false) {
            this.token = null
            this.user = null
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            if (!silent) {
                // si quieres, aquí podrías router.push a public-home
            }
        },
    },
})
