<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type PostulacionDTO = {
  id: number
  programaObjetivo: string
  estado: string
  convocatoria: {
    id: number
    nombre: string
    programa?: string
  }
  fechaCreacion?: string | null
  fechaEnvio?: string | null
}

const auth = useAuthStore()
const router = useRouter()

const postulaciones = ref<PostulacionDTO[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadMisPostulaciones() {
  loading.value = true
  error.value = null
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    }
    // Si tu auth store expone token:
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`

    const res = await fetch('/api/postulaciones/mias', {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Error ${res.status}`)
    }

    const data = await res.json()
    postulaciones.value = Array.isArray(data) ? data : []
  } catch (err: any) {
    console.error('Error cargando postulaciones:', err)
    error.value =
      err?.message?.replace('Failed to fetch', 'No se pudo comunicar con el servidor') ??
      'Error al cargar tus postulaciones'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMisPostulaciones()
})

// Navegar a la vista de documentos para una postulación
function verDocumentos(postulacionId: number) {
  router.push({ name: 'documentos', params: { id: postulacionId } })
}
</script>

<template>
  <section class="page mis-postulaciones">
    <div class="container">
      <div class="page-header card">
        <h1 class="title">Mis postulaciones</h1>
        <p class="subtitle">Aquí verás el estado de tus postulaciones y podrás subir o revisar documentos.</p>
      </div>

      <div class="card">
        <div v-if="loading" class="center p-6">
          <div class="spinner" aria-hidden="true"></div>
          <p>Cargando tus postulaciones...</p>
        </div>

        <div v-else-if="error" class="p-6">
          <p class="error">Ocurrió un error: {{ error }}</p>
          <button class="btn" @click="loadMisPostulaciones">Reintentar</button>
        </div>

        <div v-else>
          <div v-if="postulaciones.length === 0" class="empty p-6">
            <p>No tienes postulaciones todavía.</p>
            <RouterLink :to="{ name: 'convocatorias' }" class="btn btn-primary">Ver convocatorias</RouterLink>
          </div>

          <div v-else class="grid board-grid">
            <article v-for="p in postulaciones" :key="p.id" class="board-item">
              <div class="board-item-head">
                <div>
                  <h3 class="item-title">{{ p.convocatoria.nombre }}</h3>
                  <div class="muted small">{{ p.convocatoria.programa ?? '' }}</div>
                </div>
                <div class="status">
                  <span class="pill" :data-estado="p.estado">{{ p.estado }}</span>
                </div>
              </div>

              <p class="item-desc" style="min-height: 40px;">
                <strong>Programa objetivo:</strong> {{ p.programaObjetivo ?? '—' }}
              </p>

              <div class="meta small muted">
                <div v-if="p.fechaCreacion">Creada: {{ new Date(p.fechaCreacion).toLocaleString() }}</div>
                <div v-if="p.fechaEnvio">Enviada: {{ new Date(p.fechaEnvio).toLocaleString() }}</div>
              </div>

              <div class="item-actions">
                <button class="btn mini" @click="verDocumentos(p.id)">
                  Ver documentos
                </button>

                <!-- Si quieres permitir subir documentos desde aquí, redirige al mismo endpoint documentos -->
                <RouterLink
                  :to="{ name: 'documentos', params: { id: p.id } }"
                  class="btn mini outline"
                >
                  Subir / Gestionar evidencias
                </RouterLink>

                <RouterLink
                   v-if="$router.hasRoute('convocatoria')"
                   :to="{ name: 'convocatoria', params: { id: p.convocatoria.id } }"
                   class="btn mini"
                >
                  Ver convocatoria
                </RouterLink>

              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page {
  padding: 2rem 1rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

/* --- CARDS --- */
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
}

.page-header .title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.page-header .subtitle {
  color: #666;
  font-size: 0.95rem;
}

/* --- GRID DE POSTULACIONES --- */
.board-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.board-item {
  background: #f9fafb;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #e4e4e4;
  transition: all .12s ease-in-out;
}

.board-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

/* --- CABECERA DEL ITEM --- */
.board-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.item-title {
  font-size: 1.15rem;
  font-weight: 600;
}

.muted {
  color: #777;
}

.small {
  font-size: 0.85rem;
}

/* --- ESTADO --- */
.pill {
  padding: 0.28rem 0.6rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

/* Colores según estado */
.pill[data-estado="enviado"] {
  background: #d1fae5;
  color: #047857;
}
.pill[data-estado="creado"] {
  background: #e0f2fe;
  color: #0369a1;
}
.pill[data-estado="rechazado"] {
  background: #fee2e2;
  color: #b91c1c;
}
.pill[data-estado="aceptado"] {
  background: #d9f99d;
  color: #4d7c0f;
}

/* --- BOTONES --- */
.btn {
  display: inline-block;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background .15s ease-in-out;
}

.btn:hover {
  background: #1d4ed8;
}

.btn.mini {
  font-size: 0.8rem;
  padding: 0.35rem 0.7rem;
}

.btn.outline {
  background: transparent;
  border: 1px solid #2563eb;
  color: #2563eb;
}

.btn.outline:hover {
  background: #2563eb;
  color: white;
}

/* --- LOADING --- */
.center {
  text-align: center;
}

.spinner {
  margin: 0 auto 0.8rem;
  width: 32px;
  height: 32px;
  border: 3px solid #d4d4d4;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.9s infinite linear;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- EMPTY VIEW --- */
.empty {
  text-align: center;
}
</style>

