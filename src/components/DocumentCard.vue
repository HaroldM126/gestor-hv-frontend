<template>
  <div class="document-card">
    <div class="document-icon">
      {{ getFileIcon(props.document.type) }}
    </div>
    <div class="document-info">
      <h3 class="document-name">{{ props.document.name }}</h3>
      <p class="document-meta">
        {{ formatFileSize(props.document.size) }} •
        {{ formatDate(props.document.uploadDate) }}
      </p>
    </div>
    <div class="document-actions">
      <button @click="downloadDocument" class="btn-icon" title="Descargar">⬇️</button>
      <button @click="deleteDocument" class="btn-icon" title="Eliminar">🗑️</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  url: string
}

interface Props {
  document: Document
}

const props = defineProps<Props>()
const emit = defineEmits<{
  delete: [id: string]
}>()

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return '📕'
  if (type.includes('word')) return '📘'
  if (type.includes('image')) return '🖼️'
  return '📄'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES')
}

const downloadDocument = () => {
  window.open(props.document.url, '_blank')
}

const deleteDocument = () => {
  if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
    emit('delete', props.document.id)
  }
}
</script>

<style scoped>
.document-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s ease;
}

.document-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.document-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.document-info {
  flex: 1;
}

.document-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.document-meta {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.btn-icon:hover {
  background: #f5f5f5;
}
</style>
