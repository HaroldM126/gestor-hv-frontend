<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'

const auth = useAuthStore()
</script>

<template>
  <!-- Navbar solo en Home (si lo quieres global, muévelo a App.vue) -->
  <Navbar />

  <section class="home">
    <div class="container">
      <div class="hero card">
        <div class="badge">Plataforma Institucional</div>
        <h1 class="title">Gestor de Hojas de Vida</h1>
        <p class="subtitle">
          Postulación, seguimiento y evaluación en un solo lugar.
        </p>

        <!-- Acciones según sesión -->
        <div class="actions" v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="btn btn-primary">Iniciar sesión</RouterLink>
          <RouterLink to="/register" class="btn btn-outline">Crear cuenta</RouterLink>
        </div>

        <div class="actions" v-else>
          <p class="welcome">Bienvenido, <b>{{ auth.user?.usuario }}</b></p>
          <div class="actions-row">
            <RouterLink to="/perfil" class="btn btn-primary">Ir a mi perfil</RouterLink>
            <RouterLink v-if="auth.role === 'ADMIN'" to="/admins" class="btn btn-ghost">
              Administradores
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Info lateral -->
      <aside class="info card">
        <h2 class="card-title">¿Cómo empezar?</h2>
        <ol class="steps">
          <li>Crea tu cuenta o inicia sesión.</li>
          <li>Completa tu perfil y sube tu hoja de vida.</li>
          <li>Postúlate a las convocatorias activas.</li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<style scoped>
/* Lienzo general */
.home {
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 10% 10%, #0b6fbf22, transparent),
    radial-gradient(1200px 600px at 90% 20%, #0b6fbf22, transparent),
    linear-gradient(145deg, #0a4f86, #0e74b9);
  padding: 2rem 1rem;
  display: grid;
}

/* Grid de contenido */
.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .container {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}

/* Tarjetas base */
.card {
  background: #fff;
  color: #0e1a2a;
  border-radius: 16px;
  padding: clamp(1.25rem, 4vw, 2rem);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
  border: 1px solid #e6ebf1;
}

/* Bloque principal (hero) */
.hero {
  text-align: center;
}

.badge {
  display: inline-block;
  font-size: 0.75rem;
  letter-spacing: .3px;
  padding: .35rem .6rem;
  border: 1px solid #d6dee6;
  border-radius: 999px;
  background: #f3f7fb;
  color: #41576e;
  margin-bottom: .75rem;
}

.title {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 800;
  margin: 0.15rem 0 0.35rem;
  color: #0a2a4a;
  letter-spacing: .2px;
}

.subtitle {
  color: #5b6b7c;
  margin: 0 0 1.25rem;
  font-size: clamp(.98rem, 2.6vw, 1.05rem);
}

/* Acciones */
.actions {
  margin-top: .75rem;
  display: grid;
  gap: .75rem;
}

.actions-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: .75rem;
  justify-content: center;
}

.welcome {
  margin: 0 0 .25rem;
  color: #33485f;
}

/* Info lateral */
.info {
  align-self: stretch;
}

.card-title {
  font-size: 1.15rem;
  margin: 0 0 .6rem;
  color: #0a2a4a;
  font-weight: 800;
}

.steps {
  margin: 0;
  padding-left: 1.2rem;
  color: #4a5f74;
  line-height: 1.7;
}

/* Botones reutilizables */
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
  border-radius: 10px;
  padding: .78rem 1rem;
  font-weight: 700;
  border: 1px solid transparent;
  transition: transform .04s ease, background-color .18s ease, border-color .18s ease, color .18s ease;
}

.btn:active {
  transform: translateY(1px);
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

.btn-outline {
  background: transparent;
  color: #0b6fbf;
  border-color: #0b6fbf;
}

.btn-outline:hover {
  background: #e8f3ff;
}

.btn-ghost {
  background: #f7f9fc;
  color: #0a2a4a;
  border-color: #e5ebf1;
}

.btn-ghost:hover {
  background: #eef4fb;
}
</style>
