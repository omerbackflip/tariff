import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      redirect: {
        name: "item-table",
        params: { tableModel: "binarits" }
      }
    },
    {
      path: "/table-list",
      name: "table-list",
      component: () => import("./components/TableList")
    },
    {
      path: "/item-table/:tableModel",
      name: "item-table",
      component: () => import("./components/ItemTable"),
      props: true
    }
  ]
});