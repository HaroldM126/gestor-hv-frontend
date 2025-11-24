<template>
  <div class="p-4">

    <h1 class="titulo">Convocatorias</h1>

    <!-- FILTROS -->
    <div class="filters">
      <input
        type="text"
        v-model="busqueda"
        @input="fetchConvocatorias"
        placeholder="Buscar por nombre..."
        class="input-buscar"
      />

      <select v-model="estado" @change="fetchConvocatorias" class="select-filtro">
        <option value="">Todas</option>
        <option value="abierta">Abierta</option>
        <option value="cerrada">Cerrada</option>
      </select>
    </div>

    <!-- SKELETONS -->
    <div v-if="loading" class="convocatorias-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <!-- SIN RESULTADOS -->
    <div v-else-if="!convocatorias.length" class="empty">
      No se encontraron convocatorias.
    </div>

    <!-- GRID DE CONVOCATORIAS -->
    <div v-else class="convocatorias-grid">
      <div
        v-for="convocatoria in convocatorias"
        :key="convocatoria.id"
        class="convocatoria-card"
        :class="{ 'convocatoria-abierta': convocatoria.estado === 'abierta' }"
      >
        <div class="card-header">
          <h3>{{ convocatoria.nombre }}</h3>
          <span class="estado-badge" :class="convocatoria.estado">
            {{ convocatoria.estado }}
          </span>
        </div>

        <div class="card-body">
          <p><strong>Programa:</strong> {{ convocatoria.programa }}</p>
          <p><strong>Tipo:</strong> {{ convocatoria.tipoVinculacion }}</p>
          <p><strong>Cierre:</strong> {{ formatFecha(convocatoria.fechaCierre) }}</p>
        </div>

        <div class="card-actions">
          <button
            v-if="convocatoria.estado === 'abierta'"
            @click="postularse(convocatoria.id)"
            class="btn-postular"
          >
            📝 Postularme
          </button>
          <button v-else disabled class="btn-cerrada">
            ❌ Cerrada
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

/* TIPADO DE LAS CONVOCATORIAS */
interface Convocatoria {
  id: number
  nombre: string
  estado: string
  programa: string
  tipoVinculacion: string
  fechaCierre: string
}

const router = useRouter()

/* ESTADOS TIPADOS */
const convocatorias = ref<Convocatoria[]>([])
const estado = ref<string>('')
const busqueda = ref<string>('')
const loading = ref<boolean>(true)

/* FUNCIÓN PARA CARGAR CONVOCATORIAS */
const fetchConvocatorias = async () => {
  try {
    loading.value = true

    const query: string[] = []
    if (estado.value) query.push(`estado=${estado.value}`)
    if (busqueda.value) query.push(`q=${busqueda.value}`)

    const url = `/convocatorias${query.length ? `?${query.join('&')}` : ''}`

    const res = await api.get(url)
    convocatorias.value = res.data
  } catch (error) {
    console.error('Error cargando convocatorias:', error)
  } finally {
    loading.value = false
  }
}

/* FUNCIÓN PARA POSTULARSE */
const postularse = async (convocatoriaId: number) => {
  try {
    const res = await api.post('/postulaciones', {
      convocatoriaId,
      programaObjetivo: 'Postulación desde frontend',
    })

    router.push(`/postulaciones/${res.data.id}/documentos`)
  } catch (error: unknown) {
    console.error('Error creando postulación:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al postularse'
    alert(errorMessage)
  }
}

/* FORMATEO DE FECHA */
const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

/* CARGA INICIAL */
onMounted(fetchConvocatorias)
</script>

<style scoped>
.titulo {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.input-buscar,
.select-filtro {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.convocatorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* TARJETAS */
.convocatoria-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: 0.25s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.convocatoria-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.convocatoria-abierta {
  border-left: 4px solid #28a745;
}

/* HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.estado-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.estado-badge.abierta {
  background: #d4edda;
  color: #155724;
}

.estado-badge.cerrada {
  background: #f8d7da;
  color: #721c24;
}

.card-body p {
  margin: 8px 0;
  color: #555;
}

.btn-postular,
.btn-cerrada {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
}

.btn-postular {
  background: #007bff;
  color: white;
}

.btn-postular:hover {
  background: #0056b3;
}

.btn-cerrada {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

/* SKELETON */
.skeleton-card {
  height: 180px;
  border-radius: 12px;
  background: #ececec;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.35; }
  100% { opacity: 1; }
}

.empty {
  padding: 40px 0;
  font-size: 18px;
  color: #555;
  text-align: center;
}
</style>
