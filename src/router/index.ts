// src/router/index.ts - CORREGIR esta ruta
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConvocatoriasView from '../views/ConvocatoriasView.vue'
import DocumentosView from '@/views/DocumentosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/convocatorias',
      name: 'convocatorias',
      component: ConvocatoriasView,
    },
    {
      path: '/postulaciones/:id/documentos',
      name: 'documentos',
      component: DocumentosView,
      meta: { requiresAuth: true },
    },
  ],
})

export default router
