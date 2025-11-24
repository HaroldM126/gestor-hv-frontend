<!-- src/views/ConvocatoriasView.vue - VERSIÓN MEJORADA -->
<template>
  <div class="p-4">
    <h1>Convocatorias</h1>

    <div class="filters">
      <label for="estado">Filtrar por estado:</label>
      <select v-model="estado" @change="fetchConvocatorias">
        <option value="">Todas</option>
        <option value="abierta">Abierta</option>
        <option value="cerrada">Cerrada</option>
      </select>
    </div>

    <div class="convocatorias-grid">
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
          <button v-else disabled class="btn-cerrada">❌ Cerrada</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const convocatorias = ref<any[]>([])
const estado = ref('')

const fetchConvocatorias = async () => {
  try {
    const res = await api.get(`/convocatorias${estado.value ? `?estado=${estado.value}` : ''}`)
    convocatorias.value = res.data
  } catch (error) {
    console.error('Error cargando convocatorias:', error)
  }
}

const postularse = async (convocatoriaId: number) => {
  try {
    // 1. Crear la postulación
    const res = await api.post('/postulaciones', {
      convocatoriaId: convocatoriaId,
      programaObjetivo: 'Postulación desde frontend', // Podés hacer un modal para esto después
    })

    // 2. Redirigir a la vista de documentos
    router.push(`/postulaciones/${res.data.id}/documentos`)
  } catch (error: any) {
    console.error('Error creando postulación:', error)
    alert(error.response?.data?.message || 'Error al postularse')
  }
}

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

onMounted(fetchConvocatorias)
</script>

<style scoped>
.convocatorias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.convocatoria-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.convocatoria-abierta {
  border-left: 4px solid #28a745;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.estado-badge {
  padding: 4px 8px;
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
  color: #666;
}

.card-actions {
  margin-top: 16px;
}

.btn-postular {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.btn-postular:hover {
  background: #0056b3;
}

.btn-cerrada {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  width: 100%;
  cursor: not-allowed;
}

.filters {
  margin-bottom: 1rem;
}
</style>
