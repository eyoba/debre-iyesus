<template>
  <div id="app">
    <ClearCache />
    <router-view />
  </div>
</template>

<script>
import ClearCache from './components/ClearCache.vue'

export default {
  name: 'App',
  components: {
    ClearCache
  }
}
</script>