<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- RouterView se encargará de renderizar el layout correspondiente (PublicLayout o AppLayout) -->
  <RouterView />
</template>

<style>
/* Estilos base globales */
:root {
  font-family: 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif;
  background-color: #f6f8fa;
  color: #222;
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
}
</style>
