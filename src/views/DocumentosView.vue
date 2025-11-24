<template>
  <div class="documentos-view">
    <div class="header">
      <h1>Documentos de Postulación</h1>
      <p v-if="postulacion.convocatoria">
        Convocatoria: <strong>{{ postulacion.convocatoria.nombre }}</strong>
      </p>
      <p v-else-if="!errorPostulacion">Cargando información...</p>
    </div>

    <!-- Estado de la postulación -->
    <div class="estado-section" v-if="!errorPostulacion">
      <div class="estado-badge" :class="estadoClass">Estado: {{ postulacion.estado }}</div>
      <p v-if="postulacion.estado === 'borrador'" class="estado-message">
        📝 Subí todos los documentos requeridos para enviar tu postulación
      </p>
      <p v-else-if="postulacion.estado === 'enviada'" class="estado-message">
        ✅ Postulación enviada - En revisión por el comité
      </p>
      <p v-else class="estado-message">📊 Estado actual: {{ postulacion.estado }}</p>
    </div>

    <!-- Información de la postulación -->
    <div class="postulacion-info" v-if="postulacion.programaObjetivo && !errorPostulacion">
      <h3>Información de la Postulación</h3>
      <p><strong>Programa objetivo:</strong> {{ postulacion.programaObjetivo }}</p>
      <p><strong>Fecha de creación:</strong> {{ formatFecha(postulacion.fechaCreacion) }}</p>
      <p v-if="postulacion.fechaEnvio">
        <strong>Fecha de envío:</strong> {{ formatFecha(postulacion.fechaEnvio) }}
      </p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="errorPostulacion" class="alert alert-error">
      <h3>⚠️ No se pudo cargar la postulación completa</h3>
      <p>Pero puedes continuar subiendo documentos. ID de postulación: {{ postulacionId }}</p>
      <button @click="recargarDatos" class="btn-reintentar">🔄 Reintentar carga</button>
    </div>

    <!-- Lista de documentos -->
    <DocumentosList
      :documentos="documentos"
      :postulacionId="postulacionId"
      @documento-subido="onDocumentoSubido"
    />

    <!-- Botones de acción -->
    <div class="actions" v-if="postulacion.estado === 'borrador' && !errorPostulacion">
      <button
        @click="enviarPostulacion"
        :disabled="!todosDocumentosCompletos || enviando"
        class="btn-enviar"
      >
        {{
          enviando
            ? 'Enviando...'
            : todosDocumentosCompletos
              ? '📤 Enviar Postulación'
              : `📋 Faltan ${documentosFaltantes.length} documentos`
        }}
      </button>

      <button @click="volverAConvocatorias" class="btn-volver">← Volver a Convocatorias</button>
    </div>

    <!-- Mensaje de éxito -->
    <div v-if="mensajeExito" class="alert alert-success">
      {{ mensajeExito }}
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading">
      <div class="spinner"></div>
      Cargando información de postulación...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocumentosList from '@/components/DocumentosList.vue'
import api from '@/services/api'

// Types
interface Documento {
  id: number
  tipoDocumento: string
  nombreArchivo: string
  fechaSubida: string
  verificado: boolean
}

interface Convocatoria {
  id: number
  nombre: string
}

interface Postulacion {
  id: number
  estado: string
  programaObjetivo: string
  fechaCreacion: string
  fechaEnvio?: string
  convocatoria?: Convocatoria
}

const route = useRoute()
const router = useRouter()

// Estado reactivo
const postulacionId = ref<number>(Number(route.params.id))
const postulacion = ref<Postulacion>({} as Postulacion)
const documentos = ref<Documento[]>([])
const cargando = ref(true)
const enviando = ref(false)
const mensajeExito = ref('')
const errorPostulacion = ref(false)

// Lista completa de tipos de documentos requeridos
const todosLosTiposDocumentos = [
  'a', 'b', 'c_front', 'c_back', 'd', 'e', 'f', 'g', 
  'h', 'i', 'j', 'k', 'l', 'm', 'n'
]

// Computed
const todosDocumentosCompletos = computed(() => {
  const tiposSubidos = documentos.value.map((doc) => doc.tipoDocumento)
  return todosLosTiposDocumentos.every((tipo) => tiposSubidos.includes(tipo))
})

const documentosFaltantes = computed(() => {
  const tiposSubidos = documentos.value.map((doc) => doc.tipoDocumento)
  return todosLosTiposDocumentos.filter((tipo) => !tiposSubidos.includes(tipo))
})

const estadoClass = computed(() => {
  return `estado-${postulacion.value.estado}`
})

// Methods
const onDocumentoSubido = (nuevoDocumento: Documento) => {
  documentos.value.push(nuevoDocumento)
}

const enviarPostulacion = async () => {
  if (!todosDocumentosCompletos.value) return

  enviando.value = true
  mensajeExito.value = ''

  try {
    console.log('🚀 Enviando postulación ID:', postulacionId.value)
    await api.post(`/postulaciones/${postulacionId.value}/enviar`)

    mensajeExito.value = '✅ Postulación enviada exitosamente! Serás notificado sobre el resultado.'

    // Recargar datos para actualizar el estado
    await cargarPostulacion()
  } catch (error: any) {
    console.error('❌ Error enviando postulación:', error)
    alert(error.response?.data?.message || 'Error al enviar la postulación')
  } finally {
    enviando.value = false
  }
}

const volverAConvocatorias = () => {
  router.push('/convocatorias')
}

const recargarDatos = () => {
  errorPostulacion.value = false
  cargarDatos()
}

const formatFecha = (fecha: string) => {
  if (!fecha) return 'Fecha no disponible'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Cargar datos - VERSIÓN MEJORADA
const cargarPostulacion = async (): Promise<boolean> => {
  try {
    console.log('🔍 Cargando postulación ID:', postulacionId.value)
    const res = await api.get(`/postulaciones/${postulacionId.value}`)
    console.log('✅ Postulación cargada:', res.data)
    postulacion.value = res.data
    return true
  } catch (error: any) {
    console.error('❌ Error cargando postulación:', error)
    
    // Si falla pero tenemos el ID, usar datos básicos para continuar
    if (postulacionId.value) {
      console.log('🔄 Usando datos básicos para continuar...')
      postulacion.value = {
        id: postulacionId.value,
        estado: 'borrador',
        programaObjetivo: 'Postulación en proceso',
        fechaCreacion: new Date().toISOString(),
        convocatoria: { id: 0, nombre: 'Convocatoria' }
      }
      errorPostulacion.value = true
      return false
    } else {
      alert('Error: No se pudo identificar la postulación')
      router.push('/convocatorias')
      return false
    }
  }
}

const cargarDocumentos = async () => {
  try {
    console.log('📄 Cargando documentos para postulación:', postulacionId.value)
    const res = await api.get(`/postulaciones/${postulacionId.value}/documentos`)
    console.log('✅ Documentos cargados:', res.data.length)
    documentos.value = res.data
  } catch (error: any) {
    console.error('❌ Error cargando documentos:', error)
    // No bloqueamos la UI si falla la carga de documentos
    documentos.value = []
  }
}

const cargarDatos = async () => {
  cargando.value = true
  errorPostulacion.value = false
  
  try {
    // Cargar postulación y documentos en paralelo
    const [postulacionCargada] = await Promise.allSettled([
      cargarPostulacion(),
      cargarDocumentos()
    ])

    // Si la postulación falló completamente, mostrar error
    if (postulacionCargada.status === 'rejected') {
      errorPostulacion.value = true
    }

  } catch (error) {
    console.error('❌ Error general cargando datos:', error)
    errorPostulacion.value = true
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  if (!postulacionId.value || isNaN(postulacionId.value)) {
    console.error('❌ ID de postulación inválido:', route.params.id)
    router.push('/convocatorias')
    return
  }
  
  console.log('🎯 Iniciando vista de documentos para postulación ID:', postulacionId.value)
  cargarDatos()
})
</script>

<style scoped>
.documentos-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin-bottom: 8px;
}

.estado-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.estado-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  text-transform: capitalize;
}

.estado-borrador {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.estado-enviada {
  background-color: #d1edff;
  color: #004085;
  border: 1px solid #bee5eb;
}

.estado-message {
  margin: 0;
  font-size: 1.1em;
}

.postulacion-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 30px;
}

.postulacion-info h3 {
  margin-top: 0;
  color: #495057;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn-enviar {
  background-color: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  min-width: 200px;
}

.btn-enviar:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-enviar:not(:disabled):hover {
  background-color: #218838;
}

.btn-volver {
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.btn-volver:hover {
  background-color: #5a6268;
}

.btn-reintentar {
  background-color: #ffc107;
  color: #856404;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

.btn-reintentar:hover {
  background-color: #e0a800;
}

.alert {
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-error h3 {
  margin-top: 0;
  color: #721c24;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .documentos-view {
    padding: 15px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-enviar,
  .btn-volver {
    width: 100%;
  }
}
</style>