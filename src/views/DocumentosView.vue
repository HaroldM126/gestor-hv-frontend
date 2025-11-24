<template>
  <div class="documentos-view">
    <div class="container">
      <h1>Gestión de Documentos</h1>
      <p>Sube y gestiona tus documentos académicos y laborales</p>

      <div class="upload-section">
        <h2>Subir nuevos documentos</h2>
        <DocumentUpload />
      </div>

      <div class="documents-list">
        <h2>Documentos subidos</h2>
        <div v-if="documents.length === 0" class="empty-state">
          <p>No hay documentos subidos aún</p>
        </div>
        <div v-else class="documents-grid">
          <DocumentCard
            v-for="document in documents"
            :key="document.id"
            :document="document"
            @delete="deleteDocument"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DocumentUpload from '@/components/DocumentUpload.vue'
import DocumentCard from '@/components/DocumentCard.vue'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  url: string
}

const documents = ref<Document[]>([])

const deleteDocument = (documentId: string) => {
  documents.value = documents.value.filter((doc) => doc.id !== documentId)
}
</script>

<style scoped>
.documentos-view {
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.documents-list {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

h2 {
  color: #444;
  margin-bottom: 1rem;
}
</style>
