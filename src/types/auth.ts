export type Role = 'ADMIN' | 'DOCENTE' | 'COMITE';

export interface User {
    id: number;
    nombre?: string;
    usuario: string;
    rol: Role;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterPayload {
    nombre: string;
    usuario: string;
    password: string;
    rol?: Role; // opcional
}
