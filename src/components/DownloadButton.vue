<template>
  <button 
    @click="descargarDocumento" 
    :disabled="descargando"
    class="btn-download"
    :title="`Descargar ${nombreArchivo}`"
  >
    <span v-if="descargando">
      <span class="spinner-mini"></span> Descargando...
    </span>
    <span v-else>
      📥 Descargar
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  documentoId: number
  nombreArchivo: string
}>()

const auth = useAuthStore()
const descargando = ref(false)

const descargarDocumento = async () => {
  if (descargando.value) return
  
  descargando.value = true
  
  try {
    const token = auth.token
    
    if (!token) {
      throw new Error('No estás autenticado')
    }
    
    // Hacer la petición
    const response = await fetch(`/api/postulaciones/documentos/${props.documentoId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Error ${response.status}`)
    }
    
    // Obtener el blob del archivo
    const blob = await response.blob()
    
    // Crear URL para el blob
    const url = window.URL.createObjectURL(blob)
    
    // Crear elemento <a> para la descarga
    const link = document.createElement('a')
    link.href = url
    
    // Usar el nombre del archivo del header o el prop
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = props.nombreArchivo
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*?=["']?(?:UTF-\d["']*)?([^;"']*)["']?/i)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1])
      }
    }
    
    link.download = filename
    link.style.display = 'none'
    
    // Trigger la descarga
    document.body.appendChild(link)
    link.click()
    
    // Limpiar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
  } catch (error: any) {
    console.error('Error descargando documento:', error)
    alert(error.message || 'No se pudo descargar el documento')
  } finally {
    descargando.value = false
  }
}
</script>

<style scoped>
.btn-download {
  padding: 0.4rem 0.8rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-download:hover:not(:disabled) {
  background: #218838;
}

.btn-download:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.spinner-mini {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 5px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>