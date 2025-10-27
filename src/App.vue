<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <Navbar />
  <RouterView />
</template>

<style scoped>
/* Estilo base opcional (puedes quitarlo si no lo necesitas) */
:root {
  font-family: 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif;
  background-color: #f6f8fa;
  color: #222;
}
</style>
