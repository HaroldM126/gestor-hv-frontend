<script setup lang="ts">
// vista estática
</script>

<template>
    <main class="home-container">
        <section class="hero">
            <div class="hero-content">
                <h1>Bienvenido al Gestor de Hojas de Vida ITP</h1>
                <p>Conectando el talento de nuestra institución con el mundo laboral.</p>
                <router-link to="/register" class="cta-button">Crear mi cuenta</router-link>
            </div>
        </section>

        <section class="info-cards">
            <div class="card">
                <h3>Para Docentes</h3>
                <p>Crea tu perfil, sube tu hoja de vida y postúlate a las mejores ofertas.</p>
            </div>
            <div class="card">
                <h3>Para Empresas</h3>
                <p>Encuentra el talento que necesitas. Publica tus vacantes y filtra perfiles.</p>
            </div>
            <div class="card">
                <h3>Para Egresados</h3>
                <p>Mantén tu perfil actualizado y accede a oportunidades exclusivas para nuestra comunidad.</p>
            </div>
        </section>
    </main>
</template>

<style scoped>
.home-container {
    width: 100%;
}

.hero {
    background-color: #0056b3;
    color: white;
    padding: 5rem 2rem;
    text-align: center;
    border-bottom: 5px solid #ffc107;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
}

.cta-button {
    background-color: #ffc107;
    color: #333;
    padding: 0.8rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1rem;
    transition: transform 0.2s, background-color 0.2s;
}

.cta-button:hover {
    background-color: #ffd65a;
    transform: scale(1.05);
}

.info-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 4rem 2rem;
    flex-wrap: wrap;
    max-width: 1280px;
    margin: 0 auto;
}

.card {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    width: 350px;
    text-align: left;
    transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0056b3;
    margin-bottom: 1rem;
}

.card p {
    font-size: 1rem;
    line-height: 1.6;
    color: #444;
}
</style>
