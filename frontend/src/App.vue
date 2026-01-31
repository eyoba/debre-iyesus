<template>
  <div id="app">
    <router-view />
    <InstallPWA />
    <InstallGeezCalendar />
  </div>
</template>

<script>
import InstallPWA from './components/InstallPWA.vue'
import InstallGeezCalendar from './components/InstallGeezCalendar.vue'

export default {
  name: 'App',
  components: {
    InstallPWA,
    InstallGeezCalendar
  }
}
</script>