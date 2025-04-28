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
        path: 'leads',
        name: 'leads',
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