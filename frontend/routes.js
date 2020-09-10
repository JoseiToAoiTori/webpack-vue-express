import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

// Layouts, pages, and routing
import NotFound from './NotFound';

export default new VueRouter({
	mode: 'history',
	routes: [
		// Default layout

		// 404 route - keep last
		{path: '*', component: NotFound},
	],
});
