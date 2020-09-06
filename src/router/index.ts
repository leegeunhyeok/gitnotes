import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Welcome from '@/views/Welcome.vue';
import { provide, inject } from 'vue';

const RouterSymbol = Symbol();
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
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
