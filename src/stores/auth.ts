import { defineStore } from 'pinia';
import { AuthApi } from '@/services/auth.service';
import type { User } from '@/types/auth';

interface State {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): State => ({
        user: null,
        token: localStorage.getItem('access_token'),
        loading: false,
        error: null
    }),
    getters: {
        isAuthenticated: (s) => !!s.token && !!s.user,
        role: (s) => s.user?.rol ?? null,
    },
    actions: {
        async hydrateFromStorage() {
            const cachedUser = localStorage.getItem('user');
            if (this.token && cachedUser) {
                try {
                    this.user = JSON.parse(cachedUser);
                    // Valida token y sincroniza datos frescos
                    const me = await AuthApi.me();
                    this.user = me;
                    localStorage.setItem('user', JSON.stringify(me));
                } catch {
                    this.logout();
                }
            } else if (this.token) {
                // Si hay token pero no user, intenta cargar /me
                try {
                    const me = await AuthApi.me();
                    this.user = me;
                    localStorage.setItem('user', JSON.stringify(me));
                } catch {
                    this.logout();
                }
            }
        },
        async login(usuario: string, password: string) {
            this.loading = true; this.error = null;
            try {
                const data = await AuthApi.login({ usuario, password });
                this.token = data.access_token;
                this.user = data.user;
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'Error al iniciar sesión';
                this.logout(true);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async register(nombre: string, usuario: string, password: string, rol?: string) {
            this.loading = true; this.error = null;
            try {
                await AuthApi.register({ nombre, usuario, password, rol });
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo registrar';
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async fetchMe() {
            try {
                const me = await AuthApi.me();
                this.user = me;
                localStorage.setItem('user', JSON.stringify(me));
            } catch {
                this.logout();
            }
        },
        logout(soft = false) {
            this.user = null;
            this.token = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            if (!soft) window.location.href = '/login';
        }
    }
});
