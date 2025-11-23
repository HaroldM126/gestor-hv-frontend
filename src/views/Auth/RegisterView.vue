<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RegisterPayload, Role } from '@/types/auth'

const form = ref<RegisterPayload>({
    nombre: '',
    usuario: '',
    password: '',
    rol: undefined,
})

const roles: Role[] = ['DOCENTE', 'COMITE', 'ADMIN']
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const errorMsg = ref<string | null>(null)
const showPassword = ref(false)

const canSubmit = computed(() => {
    const u = form.value.usuario.trim()
    const n = form.value.nombre.trim()
    const p = form.value.password
    return n.length >= 3 && u.length >= 3 && p.length >= 6 && !auth.loading
})

const onSubmit = async () => {
    errorMsg.value = null

    // sanitizar y validar rápida
    form.value.usuario = form.value.usuario.trim().toLowerCase()
    form.value.nombre = form.value.nombre.trim()
    if (!canSubmit.value) {
        errorMsg.value = 'Completa todos los campos (contraseña mínima de 6 caracteres).'
        return
    }

    try {
        const message = await auth.register(form.value)
        // opcional: mostrar message
        // alert(message || 'Registro exitoso')
        const redirect = (route.query.redirect as string) || '/app'
        router.push(redirect)
    } catch (e: any) {
        errorMsg.value = e?.response?.data?.message || 'No se pudo registrar. Verifica los datos.'
    }
}
</script>

<template>
    <section class="auth-page">
        <form @submit.prevent="onSubmit" class="auth-card" novalidate>
            <h2>Crear Cuenta</h2>

            <p v-if="errorMsg" class="alert">{{ errorMsg }}</p>

            <label for="nombre">Nombre completo</label>
            <input id="nombre" v-model="form.nombre" type="text" placeholder="Tu nombre completo" autocomplete="name"
                required />

            <label for="usuario">Usuario</label>
            <input id="usuario" v-model="form.usuario" type="text" placeholder="Nombre de usuario"
                autocomplete="username" required />

            <label for="password">Contraseña</label>
            <div class="password-field">
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                    placeholder="Crea una contraseña" autocomplete="new-password" required />
                <button type="button" class="toggle" @click="showPassword = !showPassword">
                    {{ showPassword ? 'Ocultar' : 'Ver' }}
                </button>
            </div>
            <small class="hint">Mínimo 6 caracteres.</small>

            <label for="rol">Rol (opcional)</label>
            <select id="rol" v-model="form.rol">
                <option :value="undefined">Seleccionar rol (opcional)</option>
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>

            <button class="btn-primary" :disabled="!canSubmit">
                {{ auth.loading ? 'Registrando...' : 'Registrarse' }}
            </button>

            <RouterLink to="/login" class="link">¿Ya tienes cuenta? Inicia sesión</RouterLink>
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
    max-width: 420px;
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

input,
select {
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: .6rem;
    outline: none;
    width: 100%;
}

input:focus,
select:focus {
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

.hint {
    margin-top: -.6rem;
    color: #5b6470;
    font-size: .85rem;
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
