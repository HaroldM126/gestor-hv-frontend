import { http } from '@/lib/http';
import type { LoginResponse, User } from '@/types/auth';

export const AuthApi = {
    login(payload: { usuario: string; password: string }) {
        // /auth/login usa LocalStrategy con usernameField "usuario"
        return http.post<LoginResponse>('/auth/login', payload).then(r => r.data);
    },

    register(payload: { nombre: string; usuario: string; password: string; rol?: string }) {
        return http.post<User>('/auth/register', payload).then(r => r.data);
    },

    me() {
        return http.get<User>('/auth/me').then(r => r.data);
    }
};
