<template>
  <div id="app">
    <router-view />
    <InstallPWA />
  </div>
</template>

<script>
import InstallPWA from './components/InstallPWA.vue'

export default {
  name: 'App',
  components: {
    InstallPWA
  }
}
</script>