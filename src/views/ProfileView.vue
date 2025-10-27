<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'

const auth = useAuthStore()
const router = useRouter()

const goHome = () => router.push('/')
const logout = () => {
    auth.logout()
    router.push('/login')
}
</script>

<template>
    <!-- Navbar superior -->
    <Navbar />

    <section class="profile-page">
        <div class="profile-card">
            <header class="profile-header">
                <div class="avatar">
                    <span>{{ (auth.user?.usuario ?? 'U')[0]?.toUpperCase() }}</span>
                </div>
                <div class="titlebox">
                    <h2 class="title">Mi perfil</h2>
                    <p class="subtitle">Información básica de tu cuenta</p>
                </div>
            </header>

            <div v-if="auth.user" class="profile-body">
                <div class="row">
                    <span class="label">Usuario</span>
                    <span class="value">{{ auth.user.usuario }}</span>
                </div>
                <div class="row">
                    <span class="label">Rol</span>
                    <span class="chip" :data-rol="auth.user.rol">{{ auth.user.rol }}</span>
                </div>
                <div class="row" v-if="auth.user.nombre">
                    <span class="label">Nombre</span>
                    <span class="value">{{ auth.user.nombre }}</span>
                </div>

                <div class="actions">
                    <button class="btn btn-ghost" @click="auth.fetchMe()">Refrescar</button>
                    <button class="btn btn-outline" @click="goHome">Ir al inicio</button>
                    <button class="btn btn-primary" @click="logout">Cerrar sesión</button>
                </div>
            </div>

            <div v-else class="profile-body">
                <p class="loading">Cargando datos del perfil…</p>
                <div class="actions">
                    <button class="btn btn-outline" @click="auth.fetchMe()">Reintentar</button>
                    <button class="btn btn-ghost" @click="goHome">Ir al inicio</button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* ===== Lienzo general ===== */
.profile-page {
    min-height: 100vh;
    background:
        radial-gradient(1100px 500px at 10% 8%, #0b6fbf22, transparent),
        radial-gradient(1100px 500px at 92% 14%, #0b6fbf22, transparent),
        linear-gradient(145deg, #0a4f86, #0e74b9);
    display: grid;
    place-items: start center;
    padding: 2rem 1rem;
}

/* ===== Tarjeta ===== */
.profile-card {
    width: min(960px, 100%);
    background: #fff;
    border: 1px solid #e6ebf1;
    border-radius: 16px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
    padding: clamp(1.25rem, 3.2vw, 2rem);
}

/* ===== Encabezado ===== */
.profile-header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px dashed #e2e8f0;
}

.avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #0b6fbf;
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 800;
    box-shadow: 0 6px 18px rgba(11, 111, 191, .35);
    user-select: none;
}

.titlebox {
    line-height: 1.1;
}

.title {
    margin: 0;
    font-size: clamp(1.2rem, 2.6vw, 1.5rem);
    color: #0a2a4a;
    font-weight: 800;
}

.subtitle {
    margin: .25rem 0 0;
    color: #5b6b7c;
    font-size: .95rem;
}

/* ===== Cuerpo ===== */
.profile-body {
    display: grid;
    gap: .9rem;
    padding-top: 1rem;
}

.row {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: .75rem;
    align-items: center;
}

@media (max-width: 640px) {
    .row {
        grid-template-columns: 1fr;
        gap: .35rem;
    }
}

.label {
    color: #6b7a8b;
    font-weight: 700;
    font-size: .9rem;
    letter-spacing: .2px;
}

.value {
    color: #0e1a2a;
    font-weight: 600;
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .25rem .6rem;
    border-radius: 999px;
    border: 1px solid #e5ebf1;
    background: #f7f9fc;
    font-weight: 700;
    font-size: .82rem;
    letter-spacing: .3px;
    text-transform: uppercase;
    color: #0a2a4a;
}

.chip[data-rol="ADMIN"] {
    background: #fff7e6;
    border-color: #ffe0a3;
    color: #7a4b00;
}

.chip[data-rol="DOCENTE"] {
    background: #e7fff3;
    border-color: #b7f1d1;
    color: #156d45;
}

.chip[data-rol="COMITE"] {
    background: #e9f3ff;
    border-color: #bfdcff;
    color: #0b4c91;
}

/* ===== Acciones ===== */
.actions {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
    justify-content: flex-end;
    margin-top: .6rem;
}

/* ===== Botones reutilizables ===== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: .62rem .95rem;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 700;
    transition: transform .04s ease, background-color .18s ease, border-color .18s ease, color .18s ease;
}

.btn:active {
    transform: translateY(1px);
}

.btn-ghost {
    background: #f7f9fc;
    border-color: #e5ebf1;
    color: #0a2a4a;
}

.btn-ghost:hover {
    background: #eef4fb;
}

.btn-outline {
    background: transparent;
    color: #0b6fbf;
    border-color: #0b6fbf;
}

.btn-outline:hover {
    background: #e8f3ff;
}

.btn-primary {
    background: #0b6fbf;
    color: #fff;
    border-color: #0b6fbf;
}

.btn-primary:hover {
    background: #085c9c;
    border-color: #085c9c;
}

/* ===== Estado cargando ===== */
.loading {
    color: #5b6b7c;
}
</style>
