import './assets/app.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/router'

import ClickOutside from '@/directives/ClickOutsideDirective'

createApp(App).directive('click-outside', ClickOutside).use(createPinia()).use(router).mount('#app')
