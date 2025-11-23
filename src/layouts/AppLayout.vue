<script setup lang="ts">
import NavbarApp from '../components/Navbar.vue'
</script>

<template>
    <NavbarApp />
    <main class="app-shell">
        <router-view />
    </main>
</template>

<style scoped>
.app-shell {
    padding: 1rem;
}
</style>
