<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePerfilStore } from '@/stores/perfil'
import type {
    ModalidadPreferida,
    CreateDestacadoDto,
    UpdateDestacadoDto,
    CreateEvidenciaDto,
    UpdateEvidenciaDto,
    TipoEvidencia
} from '@/types/perfil'

const auth = useAuthStore()
const perfil = usePerfilStore()
const router = useRouter()

// Navegación interna de la vista
type Tab = 'datos' | 'destacados' | 'evidencias'
const activeTab = ref<Tab>('datos')

// Acciones top
const goHome = () => router.push('/app')
const logout = () => { auth.logout(); router.push('/login') }

// ---- Form perfil ----
const formPerfil = reactive({
    resumen: '' as string,
    modalidadPreferida: '' as ModalidadPreferida | '',
})

// ---- Form destacado ----
const formDestacado = reactive<CreateDestacadoDto>({
    titulo: '',
    descripcion: '',
    evidenciaUrl: '',
})
const editDestacadoId = ref<number | null>(null)
const savingDestacado = ref(false)

// ---- Form evidencia ----
const formEvidencia = reactive<CreateEvidenciaDto>({
    tipo: 'OTRO',
    nombre: '',
    url: '',
    sha256: '0000000000000000000000000000000000000000000000000000000000000000',
    fechaEmision: '',
    fechaVencimiento: '',
    notaPostulante: '',
})
const editEvidenciaId = ref<number | null>(null)
const savingEvidencia = ref(false)

// Catálogos
const tiposEvidencia: TipoEvidencia[] = ['CERTIFICADO', 'DIPLOMA', 'PUBLICACION', 'CURSO', 'OTRO']
const modalidades: ModalidadPreferida[] = ['presencial', 'virtual', 'mixta']

// Carga inicial
onMounted(async () => {
    if (!auth.user && auth.token) {
        // ⚠️ No hagas logout en catch: el store decide cuando corresponde
        await auth.hydrateFromStorage?.()
    }
    await perfil.fetchMiPerfil()

    if (perfil.perfil) {
        formPerfil.resumen = perfil.perfil.resumen ?? ''
        formPerfil.modalidadPreferida = (perfil.perfil.modalidadPreferida ?? '') as any
    }
})

const nombreUsuario = computed(() => auth.user?.usuario ?? 'Usuario')

// Guardar perfil
async function guardarPerfil() {
    const ok = await perfil.savePerfil({
        resumen: formPerfil.resumen?.trim() || undefined,
        modalidadPreferida: (formPerfil.modalidadPreferida as ModalidadPreferida) || undefined,
    })
    if (ok) {
        if (perfil.perfil) {
            formPerfil.resumen = perfil.perfil.resumen ?? ''
            formPerfil.modalidadPreferida = (perfil.perfil.modalidadPreferida ?? '') as any
        }
        alert('Perfil actualizado ✅')
    } else {
        alert(perfil.error ?? 'No se pudo guardar')
    }
}

// ---- Destacados ----
function limpiarDestacado() {
    formDestacado.titulo = ''
    formDestacado.descripcion = ''
    formDestacado.evidenciaUrl = ''
    editDestacadoId.value = null
}

async function enviarDestacado() {
    if (!formDestacado.titulo.trim()) {
        alert('El título es obligatorio')
        return
    }
    savingDestacado.value = true
    try {
        if (editDestacadoId.value) {
            const dto: UpdateDestacadoDto = {
                titulo: formDestacado.titulo || undefined,
                descripcion: formDestacado.descripcion || undefined,
                evidenciaUrl: formDestacado.evidenciaUrl || undefined,
            }
            await perfil.updateDestacado(editDestacadoId.value, dto)
        } else {
            await perfil.addDestacado({ ...formDestacado, titulo: formDestacado.titulo.trim() })
        }
        limpiarDestacado()
    } catch {
        alert(perfil.error ?? 'Error al guardar destacado')
    } finally {
        savingDestacado.value = false
    }
}

function setEditarDestacado(id: number) {
    const d = perfil.destacados.find(x => x.id === id)
    if (!d) return
    editDestacadoId.value = id
    formDestacado.titulo = d.titulo
    formDestacado.descripcion = d.descripcion ?? ''
    formDestacado.evidenciaUrl = d.evidenciaUrl ?? ''
}

async function eliminarDestacado(id: number) {
    if (!confirm('¿Eliminar destacado?')) return
    try {
        await perfil.deleteDestacado(id)
    } catch {
        alert(perfil.error ?? 'No se pudo eliminar')
    }
}

// ---- Evidencias ----
function limpiarEvidencia() {
    formEvidencia.tipo = 'OTRO'
    formEvidencia.nombre = ''
    formEvidencia.url = ''
    formEvidencia.sha256 = '0000000000000000000000000000000000000000000000000000000000000000'
    formEvidencia.fechaEmision = ''
    formEvidencia.fechaVencimiento = ''
    formEvidencia.notaPostulante = ''
    editEvidenciaId.value = null
}

async function enviarEvidencia() {
    if (!formEvidencia.nombre.trim() || !formEvidencia.url.trim()) {
        alert('Nombre y URL son obligatorios')
        return
    }
    if (!/^[0-9a-f]{64}$/i.test(formEvidencia.sha256)) {
        alert('SHA256 debe tener 64 caracteres hexadecimales')
        return
    }
    savingEvidencia.value = true
    try {
        if (editEvidenciaId.value) {
            const dto: UpdateEvidenciaDto = {
                tipo: formEvidencia.tipo,
                nombre: formEvidencia.nombre || undefined,
                url: formEvidencia.url || undefined,
                sha256: formEvidencia.sha256 || undefined,
                fechaEmision: formEvidencia.fechaEmision || undefined,
                fechaVencimiento: formEvidencia.fechaVencimiento || undefined,
                notaPostulante: formEvidencia.notaPostulante || undefined,
            }
            await perfil.updateEvidencia(editEvidenciaId.value, dto)
        } else {
            await perfil.addEvidencia({ ...formEvidencia })
        }
        limpiarEvidencia()
    } catch {
        alert(perfil.error ?? 'Error al guardar evidencia')
    } finally {
        savingEvidencia.value = false
    }
}

function setEditarEvidencia(id: number) {
    const evi = perfil.evidencias.find(x => x.id === id)
    if (!evi) return
    editEvidenciaId.value = id
    formEvidencia.tipo = evi.tipo
    formEvidencia.nombre = evi.nombre
    formEvidencia.url = evi.url
    formEvidencia.sha256 = evi.sha256
    formEvidencia.fechaEmision = evi.fechaEmision ?? ''
    formEvidencia.fechaVencimiento = evi.fechaVencimiento ?? ''
    formEvidencia.notaPostulante = evi.notaPostulante ?? ''
}
async function eliminarEvidencia(id: number) {
    if (!confirm('¿Eliminar evidencia?')) return
    try {
        await perfil.deleteEvidencia(id)
    } catch {
        alert(perfil.error ?? 'No se pudo eliminar')
    }
}
</script>

<template>
    <section class="page">
        <div class="shell">
            <!-- Header compacto -->
            <header class="head">
                <div class="id">
                    <div class="avatar"><span>{{ (nombreUsuario[0] || 'U').toUpperCase() }}</span></div>
                    <div>
                        <h1>Mi perfil</h1>
                        <p>Gestiona tu información y portafolio docente</p>
                    </div>
                </div>
                <div class="head-actions">
                    <button class="btn btn-ghost" @click="goHome">Inicio</button>
                    <button class="btn btn-primary" @click="logout">Cerrar sesión</button>
                </div>
            </header>

            <!-- Tabs -->
            <nav class="tabs" role="tablist">
                <button :class="['tab', { active: activeTab === 'datos' }]" role="tab"
                    @click="activeTab = 'datos'">Datos</button>
                <button :class="['tab', { active: activeTab === 'destacados' }]" role="tab" @click="activeTab = 'destacados'">
                    Destacados <span class="badge" v-if="perfil.destacados.length">{{ perfil.destacados.length }}</span>
                </button>
                <button :class="['tab', { active: activeTab === 'evidencias' }]" role="tab" @click="activeTab = 'evidencias'">
                    Evidencias <span class="badge" v-if="perfil.evidencias.length">{{ perfil.evidencias.length }}</span>
                </button>
            </nav>

            <!-- Contenido -->
            <div class="content">
                <!-- Loader -->
                <div v-if="perfil.loading" class="card card-skeleton">
                    <div class="sk-line"></div>
                    <div class="sk-line"></div>
                    <div class="sk-line half"></div>
                </div>

                <!-- DATOS -->
                <div v-else-if="activeTab === 'datos'" class="card">
                    <div class="grid">
                        <div>
                            <label class="label">Usuario</label>
                            <div class="value">{{ auth.user?.usuario }}</div>
                        </div>
                        <div>
                            <label class="label">Rol</label>
                            <span class="chip" :data-rol="auth.user?.rol">{{ auth.user?.rol }}</span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Resumen</label>
                        <textarea v-model="formPerfil.resumen" rows="3" class="input"></textarea>
                        <small class="hint">Describe en pocas líneas tu experiencia/docencia.</small>
                    </div>

                    <div class="field">
                        <label class="label">Modalidad preferida</label>
                        <select v-model="formPerfil.modalidadPreferida" class="input">
                            <option value="">— Seleccionar —</option>
                            <option v-for="m in modalidades" :key="m" :value="m">{{ m }}</option>
                        </select>
                    </div>

                    <div class="actions">
                        <button class="btn btn-ghost" @click="perfil.fetchMiPerfil()">Refrescar</button>
                        <button class="btn btn-primary" :disabled="perfil.saving" @click="guardarPerfil">
                            {{ perfil.saving ? 'Guardando…' : 'Guardar cambios' }}
                        </button>
                    </div>
                </div>

                <!-- DESTACADOS -->
                <div v-else-if="activeTab === 'destacados'" class="area">
                    <div class="card card-subtle">
                        <h3 class="card-title">{{ editDestacadoId ? 'Editar destacado' : 'Nuevo destacado' }}</h3>
                        <form class="grid2" @submit.prevent>
                            <input class="input" placeholder="Título*" v-model="formDestacado.titulo" />
                            <input class="input" placeholder="URL evidencia (opcional)"
                                v-model="formDestacado.evidenciaUrl" />
                            <textarea class="input grid-full" rows="2" placeholder="Descripción (opcional)"
                                v-model="formDestacado.descripcion"></textarea>
                            <div class="actions">
                                <button type="button" class="btn btn-ghost" @click="limpiarDestacado">Limpiar</button>
                                <button type="button" class="btn btn-primary" :disabled="savingDestacado"
                                    @click="enviarDestacado">
                                    {{ editDestacadoId ? (savingDestacado ? 'Actualizando…' : 'Actualizar') :
                                        (savingDestacado ? 'Agregando…' : 'Agregar') }}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div class="list" v-if="perfil.destacados.length">
                        <div class="item" v-for="d in perfil.destacados" :key="d.id">
                            <div class="item-main">
                                <b class="item-title">{{ d.titulo }}</b>
                                <p v-if="d.descripcion" class="item-desc">{{ d.descripcion }}</p>
                                <small v-if="d.evidenciaUrl"><a :href="d.evidenciaUrl" target="_blank"
                                        rel="noreferrer">Ver evidencia</a></small>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-ghost" @click="setEditarDestacado(d.id)">Editar</button>
                                <button class="btn btn-outline" @click="eliminarDestacado(d.id)">Eliminar</button>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <p>No tienes destacados aún.</p>
                        <button class="btn btn-primary" @click="activeTab = 'destacados'">Crear el primero</button>
                    </div>
                </div>

                <!-- EVIDENCIAS -->
                <div v-else class="area">
                    <div class="card card-subtle">
                        <h3 class="card-title">{{ editEvidenciaId ? 'Editar evidencia' : 'Nueva evidencia' }}</h3>
                        <form class="grid2" @submit.prevent>
                            <select class="input" v-model="formEvidencia.tipo">
                                <option v-for="t in tiposEvidencia" :key="t" :value="t">{{ t }}</option>
                            </select>
                            <input class="input" placeholder="Nombre*" v-model="formEvidencia.nombre" />
                            <input class="input grid-full" placeholder="URL*" v-model="formEvidencia.url" />
                            <input class="input grid-full" placeholder="SHA256 (64 hex)*"
                                v-model="formEvidencia.sha256" />
                            <input class="input" type="date" placeholder="Fecha emisión"
                                v-model="formEvidencia.fechaEmision" />
                            <input class="input" type="date" placeholder="Fecha vencimiento"
                                v-model="formEvidencia.fechaVencimiento" />
                            <textarea class="input grid-full" rows="2" placeholder="Nota del postulante"
                                v-model="formEvidencia.notaPostulante"></textarea>

                            <div class="actions">
                                <button type="button" class="btn btn-ghost" @click="limpiarEvidencia">Limpiar</button>
                                <button type="button" class="btn btn-primary" :disabled="savingEvidencia"
                                    @click="enviarEvidencia">
                                    {{ editEvidenciaId ? (savingEvidencia ? 'Actualizando…' : 'Actualizar') :
                                        (savingEvidencia ? 'Agregando…' : 'Agregar') }}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div class="list" v-if="perfil.evidencias.length">
                        <div class="item" v-for="e in perfil.evidencias" :key="e.id">
                            <div class="item-main">
                                <div class="item-title"><b>{{ e.tipo }}</b> — {{ e.nombre }}</div>
                                <small><a :href="e.url" target="_blank" rel="noreferrer">Abrir</a></small>
                                <p v-if="e.notaPostulante" class="item-desc">{{ e.notaPostulante }}</p>
                                <small v-if="e.fechaEmision || e.fechaVencimiento" class="item-meta">
                                    {{ e.fechaEmision ? 'Emisión: ' + e.fechaEmision : '' }}
                                    {{ e.fechaEmision && e.fechaVencimiento ? ' | ' : '' }}
                                    {{ e.fechaVencimiento ? 'Vence: ' + e.fechaVencimiento : '' }}
                                </small>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-ghost" @click="setEditarEvidencia(e.id)">Editar</button>
                                <button class="btn btn-outline" @click="eliminarEvidencia(e.id)">Eliminar</button>
                            </div>
                        </div>
                    </div>
                    <div class="empty" v-else>
                        <p>No hay evidencias registradas.</p>
                        <button class="btn btn-primary" @click="activeTab = 'evidencias'">Agregar evidencia</button>
                    </div>
                </div>
            </div>

            <!-- Pie de página contextual -->
            <footer class="foot">
                <small>Consejo: mantén tu resumen actualizado para futuras convocatorias.</small>
            </footer>
        </div>
    </section>
</template>

<style scoped>
/* Layout base */
.page {
    min-height: 100vh;
    background:
        radial-gradient(1100px 500px at 10% 8%, #0b6fbf22, transparent),
        radial-gradient(1100px 500px at 92% 14%, #0b6fbf22, transparent),
        linear-gradient(145deg, #0a4f86, #0e74b9);
    display: grid;
    place-items: start center;
    padding: 1.5rem .8rem 2.5rem;
}

.shell {
    width: min(1080px, 100%);
    display: grid;
    gap: .9rem;
}

/* Header */
.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 1px solid #e6ebf1;
    border-radius: 14px;
    padding: .9rem 1rem;
    box-shadow: 0 10px 28px rgba(0, 0, 0, .08);
}

.id {
    display: flex;
    gap: .75rem;
    align-items: center;
}

.avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #0b6fbf;
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 800;
    box-shadow: 0 6px 18px rgba(11, 111, 191, .35);
    user-select: none;
}

.head h1 {
    margin: 0;
    font-size: 1.2rem;
    color: #0a2a4a;
    font-weight: 800;
}

.head p {
    margin: .15rem 0 0;
    color: #5b6b7c;
    font-size: .92rem;
}

.head-actions {
    display: flex;
    gap: .5rem;
}

/* Tabs */
.tabs {
    display: flex;
    gap: .4rem;
    background: #ffffffaa;
    backdrop-filter: blur(2px);
    border: 1px solid #e6ebf1;
    border-radius: 12px;
    padding: .25rem;
    overflow-x: auto;
}

.tab {
    appearance: none;
    border: 0;
    background: transparent;
    padding: .6rem .9rem;
    border-radius: 10px;
    font-weight: 800;
    color: #46607a;
    cursor: pointer;
}

.tab.active {
    background: #0b6fbf;
    color: #fff;
}

.badge {
    background: #fff;
    color: #0b6fbf;
    border-radius: 999px;
    padding: .05rem .4rem;
    margin-left: .35rem;
    font-weight: 800;
}

/* Content */
.content {
    display: grid;
    gap: .9rem;
}

/* Cards */
.card {
    background: #fff;
    border: 1px solid #e6ebf1;
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 14px 30px rgba(0, 0, 0, .08);
}

.card-subtle {
    background: #fcfdff;
}

.card-title {
    margin: 0 0 .6rem;
    color: #0a2a4a;
    font-size: 1.02rem;
}

.card-skeleton {
    padding: 1.2rem;
}

.sk-line {
    height: 14px;
    background: linear-gradient(90deg, #eef2f7, #f8fbff, #eef2f7);
    border-radius: 6px;
    margin-bottom: .6rem;
    animation: pulse 1.5s infinite;
}

.sk-line.half {
    width: 50%;
}

@keyframes pulse {
    0% {
        opacity: .7
    }

    50% {
        opacity: .35
    }

    100% {
        opacity: .7
    }
}

/* Grid y campos */
.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .9rem;
    margin-bottom: .4rem;
}

.field {
    display: grid;
    gap: .35rem;
    margin-top: .6rem;
}

.label {
    color: #6b7a8b;
    font-weight: 700;
    font-size: .9rem;
    letter-spacing: .2px;
}

.value {
    color: #0e1a2a;
    font-weight: 600;
}

.hint {
    color: #7a8b9c;
}

.input {
    width: 100%;
    padding: .66rem .8rem;
    border-radius: 10px;
    border: 1px solid #e5ebf1;
    background: #fff;
    outline: none;
}

.input:focus {
    border-color: #0b6fbf;
    box-shadow: 0 0 0 3px rgba(11, 111, 191, .1);
}

/* Chips rol */
.chip {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .25rem .6rem;
    border-radius: 999px;
    border: 1px solid #e5ebf1;
    background: #f7f9fc;
    font-weight: 700;
    font-size: .82rem;
    letter-spacing: .3px;
    text-transform: uppercase;
    color: #0a2a4a;
}

.chip[data-rol="ADMIN"] {
    background: #fff7e6;
    border-color: #ffe0a3;
    color: #7a4b00;
}

.chip[data-rol="DOCENTE"] {
    background: #e7fff3;
    border-color: #b7f1d1;
    color: #156d45;
}

.chip[data-rol="COMITE"] {
    background: #e9f3ff;
    border-color: #bfdcff;
    color: #0b4c91;
}

/* Listas */
.area {
    display: grid;
    gap: .9rem;
}

.list {
    display: grid;
    gap: .6rem;
}

.item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .6rem;
    padding: .7rem .7rem .65rem;
    border: 1px solid #e5ebf1;
    border-radius: 12px;
    background: #fff;
}

.item-title {
    color: #0a2a4a;
}

.item-desc {
    color: #45596d;
    margin: .25rem 0;
}

.item-meta {
    color: #6b7a8b;
}

.item-actions {
    display: flex;
    gap: .4rem;
    align-items: center;
}

/* Actions */
.actions {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
    justify-content: flex-end;
    margin-top: .8rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: .62rem .95rem;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 800;
    transition: transform .04s, background-color .18s, border-color .18s, color .18s;
}

.btn:active {
    transform: translateY(1px);
}

.btn-ghost {
    background: #f7f9fc;
    border-color: #e5ebf1;
    color: #0a2a4a;
}

.btn-ghost:hover {
    background: #eef4fb;
}

.btn-outline {
    background: transparent;
    color: #0b6fbf;
    border-color: #0b6fbf;
}

.btn-outline:hover {
    background: #e8f3ff;
}

.btn-primary {
    background: #0b6fbf;
    color: #fff;
    border-color: #0b6fbf;
}

.btn-primary:hover {
    background: #085c9c;
    border-color: #085c9c;
}

/* Empty */
.empty {
    background: #fff;
    border: 1px dashed #cfe3ff;
    border-radius: 12px;
    padding: 1.2rem;
    text-align: center;
    color: #4a5f74;
}

/* Footer */
.foot {
    display: flex;
    justify-content: center;
    color: #5b6b7c;
}

/* Responsive */
@media (max-width: 860px) {
    .grid {
        grid-template-columns: 1fr;
    }

    .head {
        flex-direction: column;
        gap: .7rem;
        align-items: stretch;
    }

    .head-actions {
        justify-content: flex-end;
    }

    .item {
        grid-template-columns: 1fr;
    }
}
</style>
