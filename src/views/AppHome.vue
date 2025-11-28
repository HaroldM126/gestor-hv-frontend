<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api' // Ajusta la ruta según tu estructura

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

// Interface basada en tu API
interface Convocatoria {
  id: number;
  nombre: string;
  tipoVinculacion: string;
  fechaInicio: string;
  fechaCierre: string;
  programa: string;
  requisitos?: string;
  estado: string;
}

// Datos reales
const convocatoriasSugeridas = ref<Convocatoria[]>([])
const kpis = ref({
  postulaciones: 4, // Temporal - implementaremos en FASE 2
  evidencias: 2,    // Temporal - implementaremos en FASE 2
  revision: 1       // Temporal - implementaremos en FASE 2
})

// Función para cargar convocatorias ABIERTAS (sugeridas)
const cargarConvocatoriasSugeridas = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔍 [AppHome] Cargando convocatorias abiertas...')
    const res = await api.get('/convocatorias?estado=abierta')
    console.log('🔍 [AppHome] Convocatorias abiertas recibidas:', res.data)
    
    convocatoriasSugeridas.value = res.data
    
  } catch (error: any) {
    console.error('❌ [AppHome] Error cargando convocatorias:', error)
    
    if (error.response) {
      error.value = `${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`
    } else if (error.request) {
      error.value = 'No se pudo conectar al servidor'
    } else {
      error.value = error.message || 'Error inesperado'
    }
  } finally {
    loading.value = false
  }
}

// Función para postular - Misma lógica que ConvocatoriasView
const postularConvocatoria = async (convocatoriaId: number) => {
  try {
    console.log('🔍 [AppHome] Postulándose a convocatoria:', convocatoriaId)
    
    const res = await api.post('/postulaciones', {
      convocatoriaId: convocatoriaId,
      programaObjetivo: 'Postulación desde AppHome'
    })

    // Redirigir a la página de documentos de la postulación
    router.push(`/app/postulaciones/${res.data.id}/documentos`)
    
  } catch (error: any) {
    console.error('❌ [AppHome] Error creando postulación:', error)
    alert(error.response?.data?.message || 'Error al postularse')
  }
}

// Función para formatear el tipo de vinculación
const formatearTipoVinculacion = (tipo: string) => {
  const formatos: { [key: string]: string } = {
    'TIEMPO_COMPLETO': 'Tiempo completo',
    'MEDIO_TIEMPO': 'Medio tiempo',
    'CATEDRA': 'Cátedra',
    'OCASIONAL': 'Docente Ocasional'
  }
  return formatos[tipo] || tipo
}

// Función para ver todas las convocatorias
const verTodasConvocatorias = () => {
  router.push({ name: 'convocatorias' })
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarConvocatoriasSugeridas()
})
</script>

<template>
  <section class="home">
    <!-- Decor suave -->
    <div class="bg-blobs" aria-hidden="true">
      <span class="blob b1" />
      <span class="blob b2" />
    </div>

    <div class="container">
      <!-- HERO -->
      <div class="hero card">
        <div class="hero-header">
          <div class="badge">Plataforma Institucional</div>
          <h1 class="title">Gestor de Hojas de Vida</h1>
          <p class="subtitle">Postulación, seguimiento y evaluación en un solo lugar.</p>
        </div>

        <div class="hero-actions" v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="btn btn-primary">Iniciar sesión</RouterLink>
          <RouterLink to="/register" class="btn btn-accent">Crear cuenta</RouterLink>
        </div>

        <div class="hero-actions" v-else>
          <p class="welcome">
            Bienvenido, <b>{{ auth.user?.usuario }}</b>
            <span class="role" :data-rol="auth.role">{{ auth.role }}</span>
          </p>
          <div class="quick-grid">
            <RouterLink to="/app/perfil" class="quick">
              <span class="ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.33-2.67-6-8-6Z" />
                </svg>
              </span>
              <span>Ir a mi perfil</span>
            </RouterLink>

            <RouterLink to="/app/mis-postulaciones" class="quick">
              <span class="ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M3 5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v2H3Z" />
                  <path
                    d="M3 10h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM10.5 16.5l-2-2 1.4-1.4 0.6 0.58 2.5-2.48L14.5 12Z" />
                </svg>
              </span>
              <span>Mis postulaciones</span>
            </RouterLink>

            <RouterLink v-if="auth.role === 'ADMIN'" to="/app/admins" class="quick admin">
              <span class="ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6Z" />
                </svg>
              </span>
              <span>Administración</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Lateral ¿Cómo empezar? -->
      <aside class="side card">
        <h3 class="side-title">¿Cómo empezar?</h3>
        <ul class="steps">
          <li><span class="tick" aria-hidden="true">✓</span>Completa tu perfil y sube tu hoja de vida.</li>
          <li><span class="tick" aria-hidden="true">✓</span>Postúlate a las convocatorias activas.</li>
          <li><span class="tick" aria-hidden="true">✓</span>Haz seguimiento a tus postulaciones.</li>
        </ul>
        <div class="tip"><strong>Consejo:</strong> mantén tus evidencias al día para mejorar tu visibilidad.</div>
      </aside>

      <!-- Zona inferior -->
      <section class="lower">
        <div class="card kpi">
          <div class="kpi-row">
            <div class="kpi-item">
              <div class="kpi-number">{{ kpis.postulaciones }}</div>
              <div class="kpi-label">Postulaciones</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-number">{{ kpis.evidencias }}</div>
              <div class="kpi-label">Evidencias nuevas</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-number">{{ kpis.revision }}</div>
              <div class="kpi-label">En revisión</div>
            </div>
          </div>
        </div>

        <div class="card board">
          <div class="board-head">
            <h3>Convocatorias sugeridas</h3>
            <button @click="verTodasConvocatorias" class="view-all">Ver todas</button>
          </div>

          <!-- Estados de carga y error - integrados en el diseño existente -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            Cargando convocatorias activas...
          </div>
          
          <div v-else-if="error" class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button @click="cargarConvocatoriasSugeridas" class="mini">Reintentar</button>
          </div>

          <div v-else-if="convocatoriasSugeridas.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <p>No hay convocatorias abiertas en este momento</p>
            <p class="empty-sub">Vuelve pronto para nuevas oportunidades</p>
          </div>

          <div v-else class="board-grid">
            <article 
              v-for="convocatoria in convocatoriasSugeridas" 
              :key="convocatoria.id" 
              class="board-item"
            >
              <div class="pill" :class="{ 'alt': convocatoria.tipoVinculacion === 'MEDIO_TIEMPO' }">
                {{ formatearTipoVinculacion(convocatoria.tipoVinculacion) }}
              </div>
              <h4>{{ convocatoria.nombre }}</h4>
              <p>{{ convocatoria.requisitos || 'Revisa los requisitos en la convocatoria completa' }}</p>
              <button 
                @click="postularConvocatoria(convocatoria.id)" 
                class="mini"
              >
                Postular
              </button>
            </article>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* ===== Paleta institucional (ajústala aquí si hace falta) ===== */
:root {
  --itp-primary: #0056b3;
  /* Azul institucional */
  --itp-accent: #ffc107;
  /* Dorado/acento */
  --itp-bg: #ffffff;
  /* Base blanca */
  --itp-ink: #0a2a4a;
  /* Texto titular */
  --itp-ink-2: #33485f;
  /* Texto secundario */
  --itp-line: #e6ebf1;
  /* Bordes suaves */
}

/* ===== Lienzo */
.home {
  position: relative;
  min-height: 100dvh;
  padding: 2rem 1rem 3rem;
  color: var(--itp-ink);
  background:
    radial-gradient(1100px 480px at 10% -10%, rgba(0, 86, 179, .06), transparent),
    radial-gradient(900px 420px at 95% 5%, rgba(255, 193, 7, .08), transparent),
    var(--itp-bg);
  overflow: hidden;
}

/* Decor minimal */
.bg-blobs .blob {
  position: absolute;
  filter: blur(28px);
  opacity: .18;
  pointer-events: none;
  border-radius: 999px;
  mix-blend-mode: multiply;
}

.b1 {
  width: 420px;
  height: 420px;
  left: -120px;
  top: -140px;
  background: var(--itp-primary);
}

.b2 {
  width: 320px;
  height: 320px;
  right: -120px;
  top: 60px;
  background: var(--itp-accent);
}

.container {
  width: min(1200px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 1.2rem;
}

@media (min-width: 980px) {
  .container {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

/* ===== Tarjetas */
.card {
  background: #fff;
  border: 1px solid var(--itp-line);
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, .06);
}

/* ===== HERO */
.hero {
  padding: clamp(1.2rem, 3vw, 1.6rem);
}

.hero-header {
  text-align: center;
}

.badge {
  display: inline-block;
  font-size: .75rem;
  padding: .35rem .6rem;
  border: 1px solid var(--itp-line);
  border-radius: 999px;
  background: #f6f9ff;
  color: var(--itp-ink-2);
  letter-spacing: .2px;
  margin-bottom: .7rem;
}

.title {
  font-size: clamp(1.6rem, 3.4vw, 2.2rem);
  font-weight: 800;
  margin: .1rem 0 .35rem;
  color: var(--itp-ink);
}

.subtitle {
  color: #5b6b7c;
  margin: 0 0 1.1rem;
  font-size: clamp(.98rem, 2.6vw, 1.05rem);
}

.hero-actions {
  display: grid;
  gap: .8rem;
  justify-items: center;
}

.welcome {
  margin: 0;
  color: var(--itp-ink-2);
}

.role {
  margin-left: .5rem;
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .3px;
  text-transform: uppercase;
  border: 1px solid var(--itp-line);
  border-radius: 999px;
  padding: .18rem .5rem;
  background: #f7f9fc;
  color: var(--itp-ink);
}

.role[data-rol="ADMIN"] {
  background: #fff7e6;
  border-color: #ffe0a3;
  color: #7a4b00;
}

.role[data-rol="DOCENTE"] {
  background: #e7fff3;
  border-color: #b7f1d1;
  color: #156d45;
}

.role[data-rol="COMITE"] {
  background: #e9f3ff;
  border-color: #bfdcff;
  color: #0b4c91;
}

/* Quick links */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
}

@media (min-width: 620px) {
  .quick-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.quick {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: .5rem;
  padding: .75rem .85rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--itp-ink);
  border: 1px solid var(--itp-line);
  background: #fff;
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease;
}

.quick .ico {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(0, 86, 179, .08);
  color: var(--itp-primary);
}

.quick:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, .06);
  border-color: #dbe6f2;
}

.quick.admin .ico {
  background: rgba(255, 193, 7, .15);
  color: #b87100;
}

/* ===== Side */
.side {
  padding: clamp(1rem, 3vw, 1.2rem);
}

.side-title {
  margin: 0 0 .6rem;
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--itp-ink);
}

.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: .5rem;
  color: #4a5f74;
}

.steps .tick {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-right: .4rem;
  border-radius: 6px;
  background: rgba(0, 86, 179, .08);
  color: var(--itp-primary);
  font-size: .8rem;
  font-weight: 800;
}

.steps li {
  display: flex;
  align-items: start;
}

.tip {
  margin-top: .9rem;
  background: #f7f9fc;
  border: 1px solid var(--itp-line);
  border-radius: 10px;
  padding: .6rem .7rem;
  color: #30465d;
  font-size: .92rem;
}

/* ===== Lower row */
.lower {
  grid-column: 1 / -1;
  display: grid;
  gap: 1rem;
}

@media (min-width: 980px) {
  .lower {
    grid-template-columns: 1fr 2fr;
  }
}

.card {
  padding: 1rem;
}

/* KPIs */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .8rem;
}

.kpi-item {
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 12px;
  padding: .8rem;
  display: grid;
  gap: .2rem;
  text-align: center;
}

.kpi-number {
  font-weight: 900;
  font-size: 1.6rem;
  color: var(--itp-ink);
  line-height: 1;
}

.kpi-label {
  color: #5b6b7c;
  font-size: .9rem;
}

/* Board (convocatorias) */
.board {
  padding: 1rem;
}

.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .6rem;
}

.board-head h3 {
  margin: 0;
  font-size: 1.06rem;
  color: var(--itp-ink);
}

.view-all {
  text-decoration: none;
  color: var(--itp-primary);
  font-weight: 700;
  font-size: .92rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .8rem;
}

@media (max-width: 900px) {
  .board-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 620px) {
  .board-grid {
    grid-template-columns: 1fr;
  }
}

.board-item {
  background: #fff;
  border: 1px solid #edf1f6;
  border-radius: 12px;
  padding: .9rem;
  display: grid;
  gap: .35rem;
  transition: transform .08s ease, box-shadow .18s ease, border-color .18s ease;
}

.board-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, .06);
  border-color: #dbe6f2;
}

.board-item h4 {
  margin: .1rem 0;
  font-size: 1rem;
  color: var(--itp-ink);
}

.board-item p {
  margin: 0;
  color: #5b6b7c;
  font-size: .95rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .3px;
  padding: .18rem .5rem;
  border-radius: 999px;
  color: var(--itp-primary);
  background: rgba(0, 86, 179, .08);
  border: 1px solid #cfe2f3;
}

.pill.alt {
  color: #7a4b00;
  background: rgba(255, 193, 7, .15);
  border-color: #ffe199;
}

.mini {
  justify-self: start;
  margin-top: .35rem;
  padding: .48rem .75rem;
  border-radius: 10px;
  border: 1px solid var(--itp-primary);
  background: var(--itp-primary);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background .18s ease, transform .04s ease;
}

.mini:hover {
  background: #004a99;
}

.mini:active {
  transform: translateY(1px);
}

/* Botones */
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
  border-radius: 12px;
  padding: .78rem 1rem;
  font-weight: 800;
  border: 1px solid transparent;
  transition: transform .04s ease, background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease;
}

.btn:focus-visible,
.quick:focus-visible,
.mini:focus-visible,
.view-all:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, .25);
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: var(--itp-primary);
  color: #fff;
  border-color: var(--itp-primary);
}

.btn-primary:hover {
  background: #004a99;
  border-color: #004a99;
}

.btn-accent {
  background: var(--itp-accent);
  color: #333;
  border-color: var(--itp-accent);
}

.btn-accent:hover {
  filter: brightness(0.95);
}

/* Estados de carga y error - integrados en el diseño */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #5b6b7c;
  grid-column: 1 / -1;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--itp-primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-sub {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

/* Accesibilidad / motion */
@media (prefers-reduced-motion: reduce) {

  .mini,
  .quick,
  .btn {
    transition: none;
  }
  
  .spinner {
    animation: none;
  }
}

/* Dark mode sutil (opcional) */
@media (prefers-color-scheme: dark) {
  .home {
    color: #e9eef5;
    background: #10161f;
  }

  .card {
    background: #192231;
    border-color: #2b3a4c;
  }

  .badge,
  .role {
    background: rgba(255, 255, 255, .06);
    border-color: rgba(255, 255, 255, .1);
    color: #ecf4ff;
  }

  .subtitle,
  .steps,
  .kpi-label,
  .board-item p {
    color: #b9c7d6;
  }

  .quick {
    background: #1b2535;
    border-color: #2b3a4c;
    color: #ecf4ff;
  }

  .quick .ico {
    background: rgba(0, 86, 179, .18);
    color: #9bd3ff;
  }

  .tip {
    background: #1b2535;
    border-color: #2b3a4c;
    color: #d7e4f3;
  }

  .kpi-item,
  .board-item {
    background: #1b2535;
    border-color: #2b3a4c;
  }

  .pill {
    background: rgba(0, 86, 179, .2);
    border-color: rgba(207, 226, 243, .35);
    color: #cfe6ff;
  }

  .pill.alt {
    background: rgba(255, 193, 7, .2);
    border-color: rgba(255, 225, 153, .5);
    color: #ffd777;
  }

  .loading-state,
  .error-state,
  .empty-state {
    color: #b9c7d6;
  }
}
</style>