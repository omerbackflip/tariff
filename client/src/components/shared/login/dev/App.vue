<template>
    <v-app>
      <v-container>
        <LoginForm />
      </v-container>
    </v-app>
  </template>
  
  <script>
  import LoginForm from '../src/components/LoginForm.vue'
  
  export default {
    components: { LoginForm },
  }
  </script>
  