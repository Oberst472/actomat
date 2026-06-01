<template>
  <UApp :locale="uk">
    <ActForm />
  </UApp>
</template>

<script setup>
// uk (Ukrainian) renders dates as DD.MM.YYYY with a zero-padded day (01.01.2025),
// unlike pl which leaves the day unpadded (1.01.2025).
import { uk } from '@nuxt/ui/locale'
import ActForm from './components/ActForm.vue'
</script>
