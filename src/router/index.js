import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'templates',
        component: () => import('../views/TemplatesView.vue')
      },
      {
        path: 'validation',
        name: 'validation',
        component: () => import('../views/ValidationView.vue')
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router