<template>
  <v-app>
    <template v-if="!isAuthenticated">
      <v-container fill-height fluid>
        <v-layout align-center justify-center>
          <login-form @submit="handleLogin" />
        </v-layout>
      </v-container>
    </template>

    <template v-else>
      <Navbar @logout="logout"/>
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script>
import Navbar from './components/Common/Navbar.vue'
import LoginForm from './components/shared/login'
import { loadTable } from "../src/constants/constants.js";

export default {
  name: "app",
  components: {Navbar,LoginForm},
  data() {
    return {
      isAuthenticated: false,
      validUser: '',
      validpass: '',
    };
  },
  async mounted() {
    this.userInfo = (await loadTable(90));
  },
  created() {
    const authFlag = localStorage.getItem('TariffAuthenticated');
    if (authFlag === 'admin' || authFlag === 'viewer') { // viewer will be filtetred to יד1 only
      this.isAuthenticated = true;
    }
  },
  methods: {
  async handleLogin({ username, password }) {
    // חפש את המשתמש הנכון מתוך רשימת המשתמשים
    const foundUser = this.userInfo.find(u => u.table_id === 90 && u.description === username && u.GDFileId === password);

    if (foundUser) {
      this.isAuthenticated = true;
      const role = Number(foundUser.table_code) === 1 ? 'admin' : 'viewer';
      localStorage.setItem('TariffAuthenticated', role)
    } else {
      window.alert("Wrong user/password");
    }
  },

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('TariffAuthenticated');
  }
}


}
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale; */
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px;  */
}
.theme--dark.v-app-bar.v-toolbar.v-sheet {
    background-color: #1371ce;
}
.theme--dark.v-btn.v-btn--has-bg{
    background-color: #1371ce;
}

.theme--dark.v-text-field--solo > .v-input__control > .v-input__slot{
    background-color: #1371ce;
}
.v-application .primary {
    background-color: #1e0571;
    border-color: #1976d2;
}
</style>
