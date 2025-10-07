import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/question/:id',
      name: 'question',
      component: () => import('../views/QuestionView.vue'),
    },
    {
      path: '/question/:id/validate',
      name: 'validate',
      component: () => import('../views/ValidationView.vue'),
    },
    {
      path: '/results/intro',
      name: 'results-intro',
      component: () => import('../views/ResultsIntroView.vue'),
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('../views/ResultsView.vue'),
    },
  ],
})

export default router
