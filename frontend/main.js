// Import libraries
import Vue from 'vue';
import router from './routes';
import store from './store';

import App from './App';

const vm = new Vue({
	router,
	store,
	render: create => create(App),
});

vm.$mount('#app');
