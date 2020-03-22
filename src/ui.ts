import Vue from 'vue'
// @ts-ignore
import App from './App.vue'

import contenteditable from 'vue-contenteditable'

Vue.config.productionTip = false
Vue.config.devtools = false

Vue.use(contenteditable)

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  render: h => h(App)
})
