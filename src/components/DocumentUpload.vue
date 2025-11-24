<template>
  <div class="document-upload">
    <div
      class="upload-area"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      :class="{ 'drag-over': isDragOver }"
    >
      <input type="file" ref="fileInput" @change="onFileSelect" multiple style="display: none" />

      <div class="upload-content">
        <i class="upload-icon">📁</i>
        <p>Arrastra tus documentos aquí o</p>
        <button @click="triggerFileInput" class="btn-primary">Seleccionar archivos</button>
        <p class="file-types">Formatos permitidos: PDF, DOC, DOCX, JPEG, PNG (Max. 10MB)</p>
      </div>
    </div>

    <!-- Lista de archivos seleccionados -->
    <div v-if="selectedFiles.length > 0" class="file-list">
      <h3>Archivos seleccionados ({{ selectedFiles.length }})</h3>
      <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
        </div>
        <div class="file-actions">
          <button @click="removeFile(index)" class="btn-danger">Eliminar</button>
        </div>
      </div>

      <div class="upload-actions">
        <button @click="uploadFiles" :disabled="uploading" class="btn-success">
          {{ uploading ? 'Subiendo...' : 'Subir documentos' }}
        </button>
        <button @click="clearFiles" class="btn-secondary">Limpiar</button>
      </div>
    </div>

    <!-- Progreso de carga -->
    <div v-if="uploadProgress > 0" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span>{{ uploadProgress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
}

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const selectedFiles = ref<UploadedFile[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (event.dataTransfer?.files) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const processFiles = (files: File[]) => {
  const validFiles = files.filter((file) => {
    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`)
      return false
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(`El archivo ${file.name} no tiene un formato permitido`)
      return false
    }

    return true
  })

  selectedFiles.value.push(
    ...validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    })),
  )
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Simular progreso de carga (reemplazar con tu API real)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      uploadProgress.value = i
    }

    // Aquí iría la llamada real a tu API
    // await uploadToAPI(selectedFiles.value)

    alert('Documentos subidos exitosamente')
    clearFiles()
  } catch (error) {
    console.error('Error subiendo archivos:', error)
    alert('Error al subir los documentos')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<style scoped>
.document-upload {
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;
}

.upload-area.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.upload-content {
  color: #666;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.file-types {
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.5rem;
}

.file-list {
  margin-top: 2rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: white;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #666;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.upload-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.upload-progress {
  margin-top: 1rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
