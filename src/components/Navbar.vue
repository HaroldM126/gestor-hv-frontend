<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <img src="https://i0.wp.com/itp.edu.co/ITP2022/wp-content/uploads/2025/07/Logo-azul-PNG-01-scaled.png?fit=768%2C248&ssl=1" alt="Logo Universidad del Putumayo" class="logo" />
        <span class="brand-name">Gestor HV - ITP</span>
      </div>
      <div class="navbar-links">
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/about">Acerca de</RouterLink>
        <RouterLink to="/perfil">Mi Perfil</RouterLink>
        
        </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px; /* Ajusta la altura del logo según tus necesidades */
  margin-right: 12px;
  /* Si el logo tiene mucho espacio transparente, 
     puedes ajustar el 'width' también o usar 'object-fit' */
  object-fit: contain; 
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 24px; /* Espacio entre los enlaces */
}

.navbar-links a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.3s;
  padding-bottom: 4px; /* Para que el borde no se pegue al texto */
}

.navbar-links a:hover {
  color: #0056b3; /* Un azul que combine con el logo */
}

/* Estilo para el enlace activo */
.navbar-links a.router-link-exact-active {
  color: #0056b3;
  border-bottom: 2px solid #0056b3;
}

/* Los estilos para los botones .nav-button-primary y .nav-button-secondary se eliminan 
   ya que esos enlaces ya no existen en el Navbar. */
</style>