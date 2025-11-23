import { defineStore } from 'pinia'
import type {
    PerfilDocente,
    UpsertPerfilDto,
    CreateDestacadoDto,
    UpdateDestacadoDto,
    CreateEvidenciaDto,
    UpdateEvidenciaDto,
} from '@/types/perfil'
import { http } from '@/lib/http' // 👈 usa SIEMPRE el mismo cliente con interceptores

interface State {
    data: PerfilDocente | null
    loading: boolean
    saving: boolean
    error: string | null
}

export const usePerfilStore = defineStore('perfil', {
    state: (): State => ({
        data: null,
        loading: false,
        saving: false,
        error: null,
    }),

    getters: {
        perfil: (s) => s.data,
        destacados: (s) => s.data?.destacados ?? [],
        evidencias: (s) => s.data?.evidencias ?? [],
    },

    actions: {
        // ===== Perfil =====
        async fetchMiPerfil() {
            this.loading = true
            this.error = null
            try {
                const { data } = await http.get<PerfilDocente | null>('/perfil/mi-perfil')
                // Normaliza cuando el backend devuelva null
                this.data =
                    data ??
                    ({
                        user_id: 0,
                        resumen: null,
                        modalidadPreferida: null,
                        destacados: [],
                        evidencias: [],
                    } as unknown as PerfilDocente)
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'Error al cargar el perfil'
            } finally {
                this.loading = false
            }
        },

        async savePerfil(dto: UpsertPerfilDto) {
            this.saving = true
            this.error = null
            try {
                const { data } = await http.post<PerfilDocente>('/perfil/mi-perfil', dto)
                this.data = data
                return true
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo guardar el perfil'
                return false
            } finally {
                this.saving = false
            }
        },

        // ===== Destacados =====
        async addDestacado(dto: CreateDestacadoDto) {
            this.error = null
            try {
                const res = await http.post('/perfil/mi-perfil/destacados', dto)
                await this.fetchMiPerfil() // mantener consistencia
                return res.data
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo agregar el destacado'
                throw e
            }
        },

        async updateDestacado(id: number, dto: UpdateDestacadoDto) {
            this.error = null
            try {
                const res = await http.patch(`/perfil/mi-perfil/destacados/${id}`, dto)
                await this.fetchMiPerfil()
                return res.data
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo actualizar el destacado'
                throw e
            }
        },

        async deleteDestacado(id: number) {
            this.error = null
            try {
                await http.delete(`/perfil/mi-perfil/destacados/${id}`)
                await this.fetchMiPerfil()
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo eliminar el destacado'
                throw e
            }
        },

        // ===== Evidencias =====
        async addEvidencia(dto: CreateEvidenciaDto) {
            this.error = null
            try {
                const res = await http.post('/perfil/mi-perfil/evidencias', dto)
                await this.fetchMiPerfil()
                return res.data
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo agregar la evidencia'
                throw e
            }
        },

        async updateEvidencia(id: number, dto: UpdateEvidenciaDto) {
            this.error = null
            try {
                const res = await http.patch(`/perfil/mi-perfil/evidencias/${id}`, dto)
                await this.fetchMiPerfil()
                return res.data
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo actualizar la evidencia'
                throw e
            }
        },

        async deleteEvidencia(id: number) {
            this.error = null
            try {
                await http.delete(`/perfil/mi-perfil/evidencias/${id}`)
                await this.fetchMiPerfil()
            } catch (e: any) {
                this.error = e?.response?.data?.message ?? 'No se pudo eliminar la evidencia'
                throw e
            }
        },
    },
})
