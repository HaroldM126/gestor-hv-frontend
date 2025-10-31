<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue' // 1. Importamos el Navbar
</script>

<template>
  <Navbar />

  <RouterView />
</template>

<style scoped>
/* 4. Borramos todos los estilos viejos de 'header', 'logo', etc. */
/* Los estilos globales están en src/assets/main.css */
</style>