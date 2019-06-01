//import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
//import Mock from './mock'
import axios from 'axios' //引入axios依赖，和引入vue一样！
//Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//axios.defaults.baseURL = "http://localhost:9527/aigou";  // axios的全局定义：
Vue.prototype.$http = axios                             // /aigou/employee/employee/login
Vue.config.productionTip = false
const router = new VueRouter({
    routes
})
router.beforeEach((to, from, next) => {
    //NProgress.start();
    if (to.path == '/login') {                          //html5:会话机制 session：删除一个user的session//localStorage:本地存储！
        sessionStorage.removeItem('user');              //sessionStorage
    }
    let user = JSON.parse(sessionStorage.getItem('user'));
    if (!user && to.path != '/login') {                 // user==null:没有user，就是么有登录
        next({path: '/login'})                        //如果么有登录，就想访问！
    } else {
        next()
    }
})
//router.afterEach(transition => {//NProgress.done();//});
new Vue({
    router,                                              //template: '<App/>',//el: '#app',
    store,
    //components: { App }
    render: h => h(App)
}).$mount('#app')

