<template>
  <UApp :locale="pl">
    <ActForm />
  </UApp>
</template>

<script setup>
import { pl } from '@nuxt/ui/locale'
import ActForm from './components/ActForm.vue'
</script>
