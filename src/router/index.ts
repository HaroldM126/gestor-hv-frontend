// src/router/index.ts
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Forbidden from '../views/Forbidden.vue'
import NotFound from '../views/NotFound.vue'
import AppHome from '../views/AppHome.vue'

// Layouts
const PublicLayout = () => import('@/layouts/PublicLayout.vue')
const AppLayout = () => import('@/layouts/AppLayout.vue')

// Vistas públicas
const PublicHome = () => import('@/views/PublicHome.vue')
const AboutView = () => import('@/views/AboutView.vue')
const LoginView = () => import('@/views/Auth/LoginView.vue')
const RegisterView = () => import('@/views/Auth/RegisterView.vue')

// Vistas autenticadas
const ProfileView = () => import('@/views/ProfileView.vue')
const AdminsView = () => import('@/views/admin/AdminsView.vue')

// 🔵 Si tus vistas existen aún, AGRÉGALAS AQUÍ (ajusta imports)
const ConvocatoriasView = () => import('@/views/ConvocatoriasView.vue')
const DocumentosView = () => import('@/views/DocumentosView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    // Público
    {
      path: '/',
      component: PublicLayout,
      meta: { public: true },
      children: [
        { path: '', name: 'public-home', component: PublicHome, meta: { public: true } },
        { path: 'about', name: 'about', component: AboutView, meta: { public: true } },
        { path: 'login', name: 'login', component: LoginView, meta: { public: true, guestOnly: true } },
        { path: 'register', name: 'register', component: RegisterView, meta: { public: true, guestOnly: true } },
      ],
    },

    // Autenticado
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'app-home', component: AppHome },
        { path: 'perfil', name: 'perfil', component: ProfileView },
        { path: 'admins', name: 'admins', component: AdminsView, meta: { roles: ['ADMIN'] } },

        // 🔵 Aquí integro **tus rutas antiguas** dentro del nuevo layout
        { path: 'convocatorias', name: 'convocatorias', component: ConvocatoriasView },
        {
          path: 'postulaciones/:id/documentos',
          name: 'documentos',
          component: DocumentosView,
          meta: { requiresAuth: true },
        },
      ],
    },

    { path: '/forbidden', name: 'forbidden', component: Forbidden, meta: { public: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound, meta: { public: true } },
  ],
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const auth = useAuthStore()

  // Rehidratar si hay token pero no user
  if (!auth.user && auth.token) {
    try {
      await auth.hydrateFromStorage()
    } catch {
      auth.logout(true)
    }
  }

  // Evita login/register si ya está autenticado
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'app-home' }
  }

  // Rutas públicas pasan
  if (to.meta.public) return true

  // Rutas privadas
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Roles
  const roles = (to.meta.roles as string[] | undefined) ?? []
  if (roles.length > 0 && !roles.includes(auth.role as string)) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
