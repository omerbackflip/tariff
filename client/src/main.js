import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import excel from 'vue-excel-export'
import { formatDataForExport } from './utils/exportFormatter';

Vue.use(excel)
Vue.config.productionTip = false

Vue.prototype.$formatDataForExport = formatDataForExport; // Make the Exports date format to DD/MM/YYYY globally available in the app

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')