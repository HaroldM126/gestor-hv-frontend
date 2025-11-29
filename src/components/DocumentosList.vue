<!-- src/components/DocumentosList.vue - VERSIÓN CORREGIDA -->
<template>
  <div class="documentos-list">
    <h3>📋 Documentos Requeridos para Postulación</h3>
    <p class="subtitle">Debes subir todos los documentos listados below</p>
    
    <div class="documentos-grid">
      <div 
        v-for="docReq in documentosRequeridos" 
        :key="docReq.tipo"
        class="documento-item"
        :class="{ 
          'completo': estaCompleto(docReq.tipo),
          'pendiente': !estaCompleto(docReq.tipo)
        }"
      >
        <div class="doc-info">
          <span class="doc-icon">
            {{ estaCompleto(docReq.tipo) ? '✅' : '📄' }}
          </span>
          <div class="doc-details">
            <strong class="doc-name">{{ docReq.nombre }}</strong>
            <p class="doc-description">{{ docReq.descripcion }}</p>
            <div v-if="estaCompleto(docReq.tipo)" class="doc-subido">
              📎 <strong>Subido:</strong> {{ obtenerDocumentoSubido(docReq.tipo)?.nombreArchivo }}
              <span class="fecha">({{ formatFecha(obtenerDocumentoSubido(docReq.tipo)?.fechaSubida) }})</span>
            </div>
            <div v-else class="doc-pendiente">
              ⚠️ <strong>Pendiente por subir</strong>
            </div>
          </div>
        </div>

        <div class="doc-actions">
          <button 
            v-if="!estaCompleto(docReq.tipo)"
            @click="abrirUpload(docReq.tipo)"
            class="btn-upload"
          >
            Subir Archivo
          </button>
          <button 
            v-else
            @click="descargarDocumento(docReq.tipo)"
            class="btn-descargar"
          >
            Ver Documento
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="resumen" v-if="documentosRequeridos.length > 0">
      <div class="resumen-card">
        <h4>Progreso de Documentación</h4>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: porcentajeCompletado + '%' }"
          ></div>
        </div>
        <p class="progress-text">
          {{ documentosCompletados }} de {{ documentosRequeridos.length }} documentos subidos
          ({{ porcentajeCompletado }}%)
        </p>
      </div>
    </div>

    <!-- Modal para subir archivo -->
    <div v-if="showUploadModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Subir {{ documentoActual?.nombre }}</h4>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description"><strong>Descripción:</strong> {{ documentoActual?.descripcion }}</p>
          
          <form @submit.prevent="subirDocumento">
            <div class="form-group">
              <label class="form-label">Seleccionar archivo:</label>
              <input 
                type="file" 
                ref="fileInput"
                @change="onFileSelect"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
                class="file-input"
              />
              <div class="file-info" v-if="archivoSeleccionado">
                <strong>Archivo seleccionado:</strong> {{ archivoSeleccionado.name }}
                ({{ formatTamaño(archivoSeleccionado.size) }})
              </div>
              <small class="form-help">
                Formatos permitidos: PDF, JPG, PNG, DOC, DOCX | Tamaño máximo: 5MB
              </small>
            </div>

            <div class="modal-actions">
              <button type="button" @click="cerrarModal" class="btn-cancel">
                Cancelar
              </button>
              <button 
                type="submit" 
                :disabled="!archivoSeleccionado || subiendo"
                class="btn-submit"
                :class="{ 'loading': subiendo }"
              >
                {{ subiendo ? '⏳ Subiendo...' : '📤 Subir Documento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '@/services/api'

interface Props {
  documentos: any[]
  postulacionId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  documentoSubido: [documento: any]
}>()

// Estado
const showUploadModal = ref(false)
const subiendo = ref(false)
const archivoSeleccionado = ref<File | null>(null)
const documentoActual = ref<any>(null)
const fileInput = ref<HTMLInputElement>()

// Lista de documentos requeridos CON NOMBRES REALES
const documentosRequeridos = [
  { tipo: 'a', nombre: 'Hoja de Vida', descripcion: 'Formato Único publicado en la página web del Instituto Tecnológico del Putumayo' },
  { tipo: 'b', nombre: 'Declaración Juramentada de Bienes y Rentas', descripcion: 'Formulario único declaración juramentada de bienes y rentas' },
  { tipo: 'c_front', nombre: 'Cédula de Ciudadanía (Frente)', descripcion: 'Copia legible de la cédula de ciudadanía por el frente' },
  { tipo: 'c_back', nombre: 'Cédula de Ciudadanía (Reverso)', descripcion: 'Copia legible de la cédula de ciudadanía por el reverso' },
  { tipo: 'd', nombre: 'Diploma o Acta de Grado', descripcion: 'Copia del diploma o del acta de grado' },
  { tipo: 'e', nombre: 'Tarjeta Profesional', descripcion: 'Copia de la tarjeta o matrícula profesional y certificado de vigencia' },
  { tipo: 'f', nombre: 'Diplomas de Postgrado', descripcion: 'Copia de diplomas o actas de grado de los postgrados' },
  { tipo: 'g', nombre: 'Certificados de Experiencia', descripcion: 'Copia de certificados de experiencia profesional y docente' },
  { tipo: 'h', nombre: 'Certificado Tributario', descripcion: 'Certificado Tributario' },
  { tipo: 'i', nombre: 'Declaración de Inhabilidades', descripcion: 'Declaración juramentada de ausencia de inhabilidades e incompatibilidades' },
  { tipo: 'j', nombre: 'Antecedentes Disciplinarios', descripcion: 'Certificado de antecedentes disciplinarios (Procuraduría)' },
  { tipo: 'k', nombre: 'Antecedentes Fiscales', descripcion: 'Certificado de antecedentes fiscales (Contraloría)' },
  { tipo: 'l', nombre: 'Antecedentes Penales', descripcion: 'Impresión de consulta en línea de antecedentes penales (Policía Nacional)' },
  { tipo: 'm', nombre: 'Registro de Medidas Correctivas', descripcion: 'Impresión de consulta en línea del Sistema de Registro Nacional de Medidas Correctivas' },
  { tipo: 'n', nombre: 'Inhabilidades por Delitos Sexuales', descripcion: 'Impresión de consulta de inhabilidades por delitos sexuales contra menores' }
]

// Computed
const estaCompleto = (tipo: string) => {
  return props.documentos.some(doc => doc.tipoDocumento === tipo)
}

const documentosCompletados = computed(() => {
  return documentosRequeridos.filter(doc => estaCompleto(doc.tipo)).length
})

const porcentajeCompletado = computed(() => {
  return Math.round((documentosCompletados.value / documentosRequeridos.length) * 100)
})

const obtenerDocumentoSubido = (tipo: string) => {
  return props.documentos.find(doc => doc.tipoDocumento === tipo)
}

// Methods
const abrirUpload = (tipo: string) => {
  documentoActual.value = documentosRequeridos.find(doc => doc.tipo === tipo)
  showUploadModal.value = true
}

const cerrarModal = () => {
  showUploadModal.value = false
  archivoSeleccionado.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    archivoSeleccionado.value = target.files[0]
  }
}

const formatFecha = (fecha: string) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-ES')
}

const formatTamaño = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const subirDocumento = async () => {
  if (!archivoSeleccionado.value || !documentoActual.value) return

  subiendo.value = true

  try {
    const formData = new FormData()
    formData.append('archivo', archivoSeleccionado.value)
    formData.append('tipoDocumento', documentoActual.value.tipo)

    const res = await api.post(
      `/postulaciones/${props.postulacionId}/documentos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    emit('documentoSubido', res.data)
    cerrarModal()
    
  } catch (error: any) {
    console.error('Error subiendo documento:', error)
    alert(error.response?.data?.message || 'Error al subir documento')
  } finally {
    subiendo.value = false
  }
}

const descargarDocumento = (tipo: string) => {
  const documento = obtenerDocumentoSubido(tipo)
  if (documento) {
    // Aquí implementarías la descarga
    console.log('Descargar:', documento)
    alert(`Funcionalidad de descarga para: ${documento.nombreArchivo}`)
  }
}
</script>

<style scoped>
.documentos-list {
  margin: 20px 0;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 1.1em;
}

.documentos-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.documento-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
}

.documento-item.completo {
  border-color: #28a745;
  background: #f8fff9;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
}

.documento-item.pendiente {
  border-color: #ffc107;
  background: #fffef0;
}

.documento-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.doc-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.doc-icon {
  font-size: 1.8em;
  margin-top: 4px;
}

.doc-details {
  flex: 1;
}

.doc-name {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 1.2em;
  font-weight: 600;
}

.doc-description {
  color: #6c757d;
  margin-bottom: 12px;
  line-height: 1.5;
}

.doc-subido, .doc-pendiente {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9em;
}

.doc-subido {
  background: #e8f5e8;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.doc-pendiente {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.fecha {
  color: #6c757d;
  font-size: 0.85em;
  margin-left: 8px;
}

.doc-actions {
  flex-shrink: 0;
}

.btn-upload {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-upload:hover {
  background: #0056b3;
}

.btn-descargar {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-descargar:hover {
  background: #218838;
}

/* Resumen */
.resumen {
  margin-top: 30px;
}

.resumen-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.resumen-card h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.5s ease;
}

.progress-text {
  margin: 0;
  color: #495057;
  font-weight: 500;
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h4 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  color: #495057;
  margin-bottom: 20px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.file-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-info {
  background: #e7f3ff;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
  color: #004085;
}

.form-help {
  color: #6c757d;
  font-size: 0.85em;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-submit {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-submit.loading {
  background: #6c757d;
}

@media (max-width: 768px) {
  .documento-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .doc-actions {
    align-self: stretch;
  }
  
  .btn-upload, .btn-descargar {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>