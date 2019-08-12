import Vue from "vue";
import App from "./App.vue";

import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

Vue.config.productionTip = false;

Vue.use(Loading);

window.vue = new Vue({
  render: h => h(App)
}).$mount("#app");
