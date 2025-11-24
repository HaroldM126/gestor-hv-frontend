import type { AxiosResponse } from 'axios'
import api from './api'

export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  url: string
}

export const documentService = {
  async uploadDocuments(files: File[]): Promise<Document[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('documents', file)
    })

    const response: AxiosResponse<Document[]> = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        // Manejar progreso si es necesario
      }
    })

    return response.data
  },

  async getDocuments(): Promise<Document[]> {
    const response: AxiosResponse<Document[]> = await api.get('/documents')
    return response.data
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`)
  }
}