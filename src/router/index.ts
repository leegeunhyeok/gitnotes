import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Main from '@/views/Main.vue';
import { provide, inject } from 'vue';

const RouterSymbol = Symbol();
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

export const provideRouter = () => {
  provide(RouterSymbol, router);
};

export const useRouter = () => {
  const router = inject(RouterSymbol);
  if (!router) {
    throw new Error('No router provided');
  }
  return router;
};
