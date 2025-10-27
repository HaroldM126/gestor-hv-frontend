<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const logout = async () => {
    auth.logout()
    router.push('/login')
}
</script>

<template>
    <nav class="navbar">
        <div class="nav-container">
            <!-- LOGO / NOMBRE APP -->
            <RouterLink to="/" class="nav-logo">
                Gestor HV
            </RouterLink>

            <!-- BOTÓN HAMBURGUESA -->
            <button class="menu-toggle" @click="menuOpen = !menuOpen">
                <span :class="{ open: menuOpen }"></span>
                <span :class="{ open: menuOpen }"></span>
                <span :class="{ open: menuOpen }"></span>
            </button>

            <!-- MENÚ -->
            <div class="nav-links" :class="{ open: menuOpen }">
                <RouterLink to="/" class="nav-link" @click="menuOpen = false">Inicio</RouterLink>
                <RouterLink to="/about" class="nav-link" @click="menuOpen = false">Acerca</RouterLink>

                <template v-if="auth.isAuthenticated">
                    <RouterLink to="/perfil" class="nav-link" @click="menuOpen = false">
                        Perfil
                    </RouterLink>

                    <RouterLink v-if="auth.role === 'ADMIN'" to="/admins" class="nav-link" @click="menuOpen = false">
                        Administradores
                    </RouterLink>

                    <button class="btn-logout" @click="logout">Cerrar sesión</button>
                </template>

                <template v-else>
                    <RouterLink to="/login" class="nav-link" @click="menuOpen = false">
                        Iniciar sesión
                    </RouterLink>
                    <RouterLink to="/register" class="nav-link" @click="menuOpen = false">
                        Registrarse
                    </RouterLink>
                </template>
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* NAVBAR BASE */
.navbar {
    background-color: #0b6fbf;
    color: #fff;
    width: 100%;
    padding: 0.8rem 1.2rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1150px;
    margin: 0 auto;
}

/* LOGO */
.nav-logo {
    font-weight: 800;
    font-size: 1.25rem;
    color: #fff;
    text-decoration: none;
    letter-spacing: 0.5px;
}

/* LINKS */
.nav-links {
    display: flex;
    align-items: center;
    gap: 1.2rem;
}

.nav-link {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s ease;
}

.nav-link:hover {
    opacity: 0.8;
}

/* BOTÓN LOGOUT */
.btn-logout {
    background: transparent;
    color: #fff;
    border: 1px solid #fff;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
}

.btn-logout:hover {
    background: #fff;
    color: #0b6fbf;
}

/* HAMBURGUESA */
.menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 25px;
    height: 18px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.menu-toggle span {
    height: 3px;
    width: 100%;
    background-color: white;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.menu-toggle span.open:nth-child(1) {
    transform: translateY(7.5px) rotate(45deg);
}

.menu-toggle span.open:nth-child(2) {
    opacity: 0;
}

.menu-toggle span.open:nth-child(3) {
    transform: translateY(-7.5px) rotate(-45deg);
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .menu-toggle {
        display: flex;
    }

    .nav-links {
        position: absolute;
        top: 60px;
        right: 0;
        background-color: #0b6fbf;
        flex-direction: column;
        align-items: flex-start;
        width: 200px;
        padding: 1rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: -3px 5px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-links.open {
        transform: translateX(0);
    }

    .nav-link,
    .btn-logout {
        width: 100%;
        text-align: left;
        padding: 0.5rem 0;
    }
}
</style>
