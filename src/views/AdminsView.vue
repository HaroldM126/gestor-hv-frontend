<template>
    <div>
        <h2>Administradores (solo ADMIN)</h2>

        <form @submit.prevent="create" style="display:grid; gap:8px; max-width:520px; margin:12px 0;">
            <h3>Crear admin</h3>
            <input v-model="form.nombre" placeholder="Nombre" required minlength="3" />
            <input v-model="form.usuario" placeholder="Usuario" required minlength="3" />
            <input v-model="form.password" type="password" placeholder="Contraseña" required minlength="6" />
            <select v-model="form.rol">
                <option value="ADMIN">ADMIN</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="COMITE">COMITE</option>
            </select>
            <button>Guardar</button>
            <p v-if="error" style="color:#b00020">{{ error }}</p>
        </form>

        <button @click="load" style="margin-bottom:8px;">Refrescar</button>

        <table border="1" cellpadding="6" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="a in admins" :key="a.id">
                    <td>{{ a.id }}</td>
                    <td>{{ a.nombre }}</td>
                    <td>{{ a.usuario }}</td>
                    <td>{{ a.rol }}</td>
                    <td>
                        <button @click="remove(a.id)">Eliminar</button>
                    </td>
                </tr>
            </tbody>
        </table>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http } from '@/lib/http';

type Admin = { id: number; nombre: string; usuario: string; rol: 'ADMIN' | 'DOCENTE' | 'COMITE' };

const admins = ref<Admin[]>([]);
const error = ref<string | null>(null);

const form = ref<{ nombre: string; usuario: string; password: string; rol: Admin['rol'] }>({
    nombre: '', usuario: '', password: '', rol: 'ADMIN'
});

const load = async () => {
    try {
        error.value = null;
        const { data } = await http.get<Admin[]>('/admins');
        admins.value = data;
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? 'Error al cargar admins';
    }
};

const create = async () => {
    try {
        error.value = null;
        const { data } = await http.post<Admin>('/admins', form.value);
        admins.value.push(data);
        form.value = { nombre: '', usuario: '', password: '', rol: 'ADMIN' };
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? 'No se pudo crear';
    }
};

const remove = async (id: number) => {
    if (!confirm('¿Eliminar admin?')) return;
    try {
        error.value = null;
        await http.delete(`/admins/${id}`);
        admins.value = admins.value.filter(a => a.id !== id);
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? 'No se pudo eliminar';
    }
};

onMounted(load);
</script>