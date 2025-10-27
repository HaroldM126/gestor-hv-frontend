<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const usuario = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

const onSubmit = async () => {
    try {
        await auth.login(usuario.value, password.value)
        // 🔁 Redirigir al Home después del login
        router.push('/')
    } catch {
        alert('Credenciales incorrectas')
    }
}
</script>

<template>
    <section class="auth-page">
        <form @submit.prevent="onSubmit" class="auth-card">
            <h2>Iniciar Sesión</h2>

            <label>Usuario</label>
            <input v-model="usuario" type="text" placeholder="Ingresa tu usuario" required />

            <label>Contraseña</label>
            <input v-model="password" type="password" placeholder="Ingresa tu contraseña" required />

            <button class="btn-primary" :disabled="auth.loading">
                {{ auth.loading ? 'Ingresando...' : 'Entrar' }}
            </button>

            <RouterLink to="/register" class="link">¿No tienes cuenta? Regístrate</RouterLink>
        </form>
    </section>
</template>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #eef2f5;
}

.auth-card {
    background: #fff;
    padding: 2.2rem 2.8rem;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 380px;
    display: grid;
    gap: 1rem;
}

h2 {
    text-align: center;
    color: #003b73;
    margin-bottom: 1rem;
}

label {
    font-weight: 600;
    font-size: 0.95rem;
}

input {
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: 0.6rem;
    outline: none;
}

input:focus {
    border-color: #007acc;
}

.btn-primary {
    background: #007acc;
    color: white;
    font-weight: 600;
    border: none;
    padding: 0.7rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.btn-primary:hover {
    background: #005fa3;
}

.link {
    text-align: center;
    display: block;
    margin-top: 0.5rem;
    color: #007acc;
    text-decoration: none;
    font-size: 0.9rem;
}

.link:hover {
    text-decoration: underline;
}
</style>
