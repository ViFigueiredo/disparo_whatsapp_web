import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'companies',
          name: 'companies',
          component: () => import('../views/CompaniesView.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'connections',
          name: 'connections',
          component: () => import('../views/ConnectionsView.vue')
        },
        {
          path: 'templates',
          name: 'templates',
          component: () => import('../views/TemplatesView.vue')
        },
        {
          path: 'leads',
          name: 'leads',
          component: () => import('../views/LeadsView.vue')
        }
      ]
    }
  ]
})

// Guarda de navegação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated()) {
    next('/')
  } else if (requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router