import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      name: "table-list",
      component: () => import("./components/TableList")
    },
    {
      path: "/BinaritList",
      name: "binarit-list",
      component: () => import("./components/BinaritList")
    }
  ]
});