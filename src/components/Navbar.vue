<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const mobileOpen = ref(false)
const userOpen = ref(false)
const isAuthed = computed(() => auth.isAuthenticated)
const role = computed(() => auth.role ?? '')

// Bloquea scroll cuando el drawer móvil está abierto
watch(mobileOpen, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : ''
})

const homeTo = computed(() =>
  isAuthed.value ? { name: 'app-home' } : { name: 'public-home' }
)

type NavItem = { to: any; label: string; show?: boolean; badge?: number | null }
const navItems = computed<NavItem[]>(() => {
  const basePublic: NavItem[] = [
    { to: homeTo.value, label: 'Inicio', show: true },
    { to: { name: 'about' }, label: 'Acerca de', show: true },
  ]
  const baseApp: NavItem[] = [
    { to: homeTo.value, label: 'Inicio', show: true },
    { to: { name: 'perfil' }, label: 'Mi Perfil', show: true },
    { to: { name: 'admins' }, label: 'Administración', show: role.value === 'ADMIN' },
  ]
  return (isAuthed.value ? baseApp : basePublic).filter(i => i.show !== false)
})

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (!mobileOpen.value) userOpen.value = false
}
function toggleUser() {
  userOpen.value = !userOpen.value
}
function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
function goPerfil() {
  router.push({ name: 'perfil' })
  closeAll()
}
function goAdmins() {
  router.push({ name: 'admins' })
  closeAll()
}
function logout() {
  auth.logout()
  closeAll()
  router.replace({ name: 'login' })
}
function closeAll() {
  userOpen.value = false
  mobileOpen.value = false
}

// cerrar menús al hacer click afuera o al presionar Esc
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.navbar')) {
    closeAll()
  }
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeAll()
  }
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Principal">
    <div class="navbar-container">
      <!-- Brand -->
      <div class="left">
        <button class="hamburger" :class="{ open: mobileOpen }" :aria-expanded="mobileOpen ? 'true' : 'false'"
          aria-controls="primary-nav" aria-label="Abrir menú" @click.stop="toggleMobile">
          <span />
          <span />
          <span />
        </button>

        <RouterLink :to="homeTo" class="brand" aria-label="Inicio">
          <img
            src="https://i0.wp.com/itp.edu.co/ITP2022/wp-content/uploads/2025/07/Logo-azul-PNG-01-scaled.png?fit=768%2C248&ssl=1"
            alt="Logo ITP" class="logo" decoding="async" />
          <span class="brand-name">Gestor HV · ITP</span>
        </RouterLink>
      </div>

      <!-- Links desktop -->
      <div id="primary-nav" class="links">
        <RouterLink v-for="item in navItems" :key="item.label" :to="item.to" class="link"
          :class="{ active: $route.name === (item.to.name || '') }">
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </RouterLink>
      </div>

      <!-- Acciones derecha -->
      <div class="right">
        <!-- No autenticado -->
        <button v-if="!isAuthed" class="btn btn-primary" @click="goLogin">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M10 17l5-5-5-5v3H3v4h7zM13 3h6v18h-6" />
          </svg>
          Iniciar sesión
        </button>

        <!-- Autenticado -->
        <div v-else class="user">
          <button class="user-btn" :aria-expanded="userOpen ? 'true' : 'false'" aria-haspopup="menu"
            @click.stop="toggleUser">
            <span class="avatar" :title="auth.user?.usuario">
              {{ (auth.user?.usuario ?? 'U')[0]?.toUpperCase() }}
            </span>
            <span class="user-name">{{ auth.user?.usuario }}</span>
            <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          <div v-show="userOpen" class="user-menu" role="menu">
            <div class="arrow" aria-hidden="true"></div>
            <button role="menuitem" @click="goPerfil">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
              </svg>
              Mi Perfil
            </button>
            <button v-if="role === 'ADMIN'" role="menuitem" @click="goAdmins">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
              Administración
            </button>
            <hr />
            <button role="menuitem" class="danger" @click="logout">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay para drawer móvil -->
    <div class="overlay" v-show="mobileOpen" @click="mobileOpen = false" aria-hidden="true"></div>

    <!-- Menú móvil -->
    <aside class="mobile-panel" :class="{ open: mobileOpen }" aria-label="Menú móvil">
      <div class="mobile-links">
        <RouterLink v-for="item in navItems" :key="item.label" :to="item.to" @click="mobileOpen = false" class="m-link"
          :class="{ active: $route.name === (item.to.name || '') }">
          {{ item.label }}
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </RouterLink>

        <template v-if="isAuthed">
          <hr />
          <button class="as-link danger" @click="logout">Cerrar sesión</button>
        </template>
        <template v-else>
          <button class="as-link primary" @click="goLogin">
            Iniciar sesión
          </button>
        </template>
      </div>
    </aside>
  </nav>
</template>

<style scoped>
/* ====== Design tokens ====== */
:root {
  --itp-primary: #0b6fbf;
  --itp-primary-700: #085c9c;
  --ink: #0a2a4a;
  --muted: #5a6d80;
  --line: #e6ebf1;
  --bg: rgba(255, 255, 255, 0.85);
  --shadow: 0 8px 24px rgba(14, 30, 64, 0.08);
}

@media (prefers-color-scheme: dark) {
  :root {
    --itp-primary: #7bb5ff;
    --itp-primary-700: #93c4ff;
    --ink: #e6eef6;
    --muted: #a4b1bf;
    --line: #283549;
    --bg: rgba(15, 23, 42, 0.7);
    --shadow: 0 8px 28px rgba(2, 8, 23, .5);
  }
}

/* ====== Navbar ====== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: saturate(1.2) blur(10px);
  background: var(--bg);
  border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow);
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: .55rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}

/* Left: brand + hamburger */
.left {
  display: flex;
  align-items: center;
  gap: .6rem;
}

.hamburger {
  display: inline-grid;
  gap: 5px;
  padding: .5rem;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, .6);
  border-radius: 12px;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease;
}

.hamburger span {
  width: 20px;
  height: 2px;
  background: var(--ink);
  transition: transform .2s ease, opacity .2s ease;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media(min-width:940px) {
  .hamburger {
    display: none;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: .55rem;
  text-decoration: none;
  color: inherit;
}

.logo {
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .08));
}

.brand-name {
  font-weight: 900;
  color: var(--ink);
  letter-spacing: .2px;
}

/* Links desktop */
.links {
  display: none;
  gap: .25rem;
  align-items: center;
}

.link {
  position: relative;
  color: #4f667d;
  text-decoration: none;
  font-weight: 700;
  padding: .45rem .65rem;
  border-radius: 10px;
  transition: color .18s ease, background .18s ease;
}

.link:hover {
  color: var(--itp-primary);
  background: rgba(11, 111, 191, .08);
}

.link.active {
  color: var(--itp-primary);
  background: rgba(11, 111, 191, .12);
}

.badge {
  display: inline-block;
  margin-left: .35rem;
  padding: .05rem .4rem;
  border-radius: 999px;
  font-size: .72rem;
  font-weight: 800;
  background: #eaf3ff;
  color: #0b6fbf;
}

@media(min-width:940px) {
  .links {
    display: flex;
  }
}

/* Right: actions */
.right {
  display: flex;
  align-items: center;
  gap: .6rem;
}

.btn {
  border-radius: 999px;
  padding: .5rem .85rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background .18s ease, border-color .18s ease, transform .04s ease;
  display: inline-flex;
  align-items: center;
  gap: .45rem;
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: var(--itp-primary);
  color: #fff;
  border-color: var(--itp-primary);
}

.btn-primary:hover {
  background: var(--itp-primary-700);
}

/* User menu */
.user {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  background: rgba(255, 255, 255, .55);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: .25rem .5rem .25rem .25rem;
  cursor: pointer;
  transition: background .18s ease, border-color .18s ease;
}

.user-btn:hover {
  background: rgba(255, 255, 255, .8);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #fff;
  background: var(--itp-primary);
  box-shadow: 0 2px 8px rgba(11, 111, 191, .3);
}

.user-name {
  font-weight: 800;
  color: var(--ink);
}

.chev {
  width: 18px;
  height: 18px;
  color: #6a7c90;
}

.user-menu {
  position: absolute;
  right: 0;
  top: calc(100% + .6rem);
  min-width: 220px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, .12);
  padding: .4rem;
  display: grid;
  gap: .25rem;
  animation: pop .12s ease;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu .arrow {
  position: absolute;
  top: -7px;
  right: 20px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-left: 1px solid var(--line);
  border-top: 1px solid var(--line);
  transform: rotate(45deg);
}

.user-menu button {
  text-align: left;
  background: #fff;
  border: 0;
  padding: .6rem .65rem;
  border-radius: 10px;
  color: var(--ink);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: .5rem;
}

.user-menu button:hover {
  background: #f4f8ff;
}

.user-menu button svg {
  width: 18px;
  height: 18px;
}

.user-menu hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: .2rem 0;
}

.user-menu .danger {
  color: #9e1b1b;
}

.user-menu .danger:hover {
  background: #fff2f2;
}

/* Mobile: overlay + drawer */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, .35);
  backdrop-filter: blur(1px);
  z-index: 999;
  animation: fadeIn .15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
}

.mobile-panel {
  position: fixed;
  inset: 0 0 0 auto;
  width: min(86vw, 380px);
  transform: translateX(100%);
  background: #fff;
  border-left: 1px solid var(--line);
  box-shadow: -16px 0 40px rgba(2, 8, 23, .18);
  transition: transform .22s ease;
  z-index: 1000;
  display: grid;
  grid-template-rows: auto 1fr;
}

.mobile-panel.open {
  transform: translateX(0);
}

.mobile-links {
  padding: 1rem;
  display: grid;
  gap: .35rem;
  overflow-y: auto;
  max-height: 100dvh;
}

.m-link {
  text-decoration: none;
  color: #4f667d;
  font-weight: 800;
  padding: .9rem .6rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.m-link:hover {
  background: #f6f9ff;
  color: var(--itp-primary);
}

.m-link.active {
  background: #eef5ff;
  color: var(--itp-primary);
}

.as-link {
  text-align: left;
  padding: .9rem .6rem;
  border-radius: 12px;
  text-decoration: none;
  color: #566b80;
  font-weight: 800;
  background: transparent;
  border: 1px solid var(--line);
  cursor: pointer;
}

.as-link.primary {
  color: #fff;
  background: var(--itp-primary);
  border-color: var(--itp-primary);
}

.as-link.danger {
  color: #9e1b1b;
}

.mobile-links hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: .5rem 0;
}
</style>
