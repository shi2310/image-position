import Vue from 'vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import App from './App.vue'

Vue.use(Antd);

Vue.config.productionTip = false

Vue.prototype.$EventBus = new Vue();

new Vue({
  render: h => h(App),
}).$mount('#app')
