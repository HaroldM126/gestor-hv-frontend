<template>
  <div class="p-4">
    <h1>Convocatorias</h1>

    <!-- Estado de carga/error -->
    <div v-if="cargando" class="loading">Cargando convocatorias...</div>
    <div v-else-if="error" class="error">❌ Error: {{ error }}</div>
    <div v-else-if="convocatorias.length === 0" class="empty">
      No hay convocatorias disponibles
    </div>

    <div class="filters" v-if="convocatorias.length > 0">
      <label for="estado">Filtrar por estado:</label>
      <select v-model="estado" @change="fetchConvocatorias">
        <option value="">Todas</option>
        <option value="abierta">Abierta</option>
        <option value="cerrada">Cerrada</option>  
      </select>
    </div>


    <div class="convocatorias-grid" v-if="convocatorias.length > 0">
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
          <button 
            v-else
            disabled
            class="btn-cerrada"
          >
            ❌ Cerrada
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const convocatorias = ref<any[]>([]);
const estado = ref('');
const cargando = ref(true);
const error = ref('');

const fetchConvocatorias = async () => {
  cargando.value = true;
  error.value = '';
  
  try {
    console.log('🔍 [1] Haciendo request a /convocatorias...');
    const res = await api.get(`/convocatorias${estado.value ? `?estado=${estado.value}` : ''}`);
    console.log('🔍 [2] Response recibido:', res);
    console.log('🔍 [3] Datos:', res.data);
    
    convocatorias.value = res.data;
    
  } catch (error: any) {
    console.error('❌ [ERROR] Error cargando convocatorias:', error);
    error.value = error.message;
    
    // Mostrar detalles del error
    if (error.response) {
      console.error('❌ Response error:', error.response.status, error.response.data);
      error.value = `${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
      error.value = 'No se pudo conectar al servidor';
    }
  } finally {
    cargando.value = false;
  }
};

const postularse = async (convocatoriaId: number) => {
  try {
    console.log('🔍 Postulándose a convocatoria:', convocatoriaId);
    
    const res = await api.post('/postulaciones', {
      convocatoriaId: convocatoriaId,
      programaObjetivo: 'Postulación desde frontend'
    });

    router.push(`/postulaciones/${res.data.id}/documentos`);
    
  } catch (error: any) {
    console.error('❌ Error creando postulación:', error);
    alert(error.response?.data?.message || 'Error al postularse');
  }
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES');
};

onMounted(() => {
  fetchConvocatorias();
});
</script>

<style scoped>
.loading, .error, .empty {
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  border-radius: 8px;
}

.loading {
  background: #e3f2fd;
  color: #1565c0;
}

.error {
  background: #ffebee;
  color: #c62828;
}

.empty {
  background: #f5f5f5;
  color: #666;
}

.debug {
  background: #fff3e0;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 12px;
}

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