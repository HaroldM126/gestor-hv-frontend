import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '../stores/auth'; // <-- store de auth (Pinia)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas existentes (públicas)
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { public: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { public: true },
    },

    // Auth públicas
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { public: true },
    },

    // Perfil (requiere JWT)
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },

    // Solo ADMIN (JWT + rol)
    {
      path: '/admins',
      name: 'admins',
      component: () => import('../views/AdminsView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },


  ],
});

// Guardia global: verifica login y rol antes de entrar a cada ruta
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Si hay token pero aún no hay usuario en memoria (recarga), hidrata y valida /auth/me
  if (!auth.user && auth.token) {
    try {
      await auth.hydrateFromStorage();
    } catch {
      auth.logout(true);
    }
  }

  // Rutas públicas pasan directo
  if (to.meta.public) return true;

  // Rutas que requieren auth
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Validación por roles si la ruta lo exige
  const roles = to.meta.roles as string[] | undefined;
  if (roles && roles.length > 0) {
    const ok = roles.includes(auth.role as string);
    if (!ok) return { name: 'forbidden' };
  }

  return true;
});

export default router;
