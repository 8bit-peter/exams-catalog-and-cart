<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Hydrate cart store on client side
const cartStore = useCartStore()

onMounted(() => {
  cartStore.hydrate()
})
</script>

