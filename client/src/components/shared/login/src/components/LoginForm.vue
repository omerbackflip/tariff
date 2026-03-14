<template>
    <v-card class="pa-4" max-width="400" outlined style="direction: rtl;">
      <v-card-title class="headline">התחברות</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="login">
        <v-text-field
          v-model="username"
          label="שם משתמש"
          name="username"
          autocomplete="username"
          prepend-icon="mdi-account"
          outlined
          dense
          required
        />
        <v-text-field
          v-model="password"
          label="סיסמה"
          name="password"
          autocomplete="current-password"
          type="password"
          prepend-icon="mdi-lock"
          outlined
          dense
          required
        />
        <v-btn color="primary" type="submit">התחבר</v-btn>
      </v-form>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  export default {
    name: "LoginForm",
    data() {
      return {
        username: "",
        password: "",
      };
    },
    methods: {
      login() {
        this.$emit("submit", { username: this.username, password: this.password });
      },
    },
  };
  </script>
  