<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const usuario = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref<string | null>(null)

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const canSubmit = computed(() =>
    usuario.value.trim().length > 0 && password.value.length >= 4 && !auth.loading
)

// Sanitiza y resuelve el destino post-login
function resolveRedirect() {
    const q = (route.query.redirect as string) || ''
    // permite solo rutas internas de la app
    if (q && q.startsWith('/app')) return { path: q }
    // fallback: dashboard privado por nombre
    return { name: 'app-home' }
}

const onSubmit = async () => {
    errorMsg.value = null
    const u = usuario.value.trim().toLowerCase()
    const p = password.value

    if (!u || p.length < 4) {
        errorMsg.value = 'Completa usuario y contraseña (mín. 4 caracteres).'
        return
    }

    try {
        // 1) espera a que login fije token + user en el store
        await auth.login(u, p)

        // 2) espera un tick para que los getters/reactividad y guards lean el estado correcto
        await nextTick()

        // 3) redirige por NOMBRE (o path saneado)
        const target = resolveRedirect()
        // usa replace para no dejar /login en el historial
        await router.replace(target)
    } catch (e: any) {
        errorMsg.value = e?.response?.data?.message || 'Credenciales incorrectas'
    }
}
</script>

<template>
    <section class="auth-page">
        <form @submit.prevent="onSubmit" class="auth-card" novalidate>
            <h2>Iniciar Sesión</h2>

            <p v-if="errorMsg" class="alert">{{ errorMsg }}</p>

            <label for="usuario">Usuario</label>
            <input id="usuario" v-model="usuario" type="text" placeholder="Ingresa tu usuario" autocomplete="username"
                required />

            <label for="password">Contraseña</label>
            <div class="password-field">
                <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
                <button type="button" class="toggle" @click="showPassword = !showPassword">
                    {{ showPassword ? 'Ocultar' : 'Ver' }}
                </button>
            </div>

            <button class="btn-primary" :disabled="!canSubmit">
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
    box-shadow: 0 8px 20px rgba(0, 0, 0, .08);
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
    font-size: .95rem;
}

input {
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: .6rem;
    outline: none;
    width: 100%;
}

input:focus {
    border-color: #007acc;
}

.password-field {
    position: relative;
    display: grid;
}

.toggle {
    position: absolute;
    right: .5rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #007acc;
    cursor: pointer;
    font-weight: 600;
}

.btn-primary {
    background: #007acc;
    color: #fff;
    font-weight: 600;
    border: none;
    padding: .7rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background .2s ease;
}

.btn-primary[disabled] {
    opacity: .6;
    cursor: not-allowed;
}

.btn-primary:hover {
    background: #005fa3;
}

.link {
    text-align: center;
    display: block;
    margin-top: .5rem;
    color: #007acc;
    text-decoration: none;
    font-size: .9rem;
}

.link:hover {
    text-decoration: underline;
}

.alert {
    margin: 0;
    padding: .6rem .8rem;
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #7f1d1d;
    border-radius: 8px;
    font-size: .9rem;
}
</style>
