import axios from 'axios';

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Adjunta token automáticamente si existe
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Manejo de 401 para limpiar sesión
http.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            // opcional: redirigir
            // window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);
