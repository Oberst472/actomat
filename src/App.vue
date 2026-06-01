<template>
  <UApp :locale="uk">
    <ActForm />
  </UApp>
</template>

<script setup>
import { uk } from '@nuxt/ui/locale'
import ActForm from './components/ActForm.vue'
</script>
