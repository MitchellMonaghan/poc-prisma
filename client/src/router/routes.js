
const routes = [
  {
    path: '/',
    component: () => import('layouts/public.vue'),
    children: [
      // Anonymous only
      { path: '', component: () => import('pages/Index.vue'), meta: { anonymousOnly: true } },
      { name: 'login', path: '/login', component: () => import(`pages/auth/login`), meta: { anonymousOnly: true } },
      { name: 'register', path: '/register', component: () => import(`pages/auth/register`), meta: { anonymousOnly: true } },
      { name: 'verifyEmail', path: '/verifyEmail', component: () => import(`pages/auth/verifyEmail.vue`), meta: { anonymousOnly: true } },
      { name: 'forgotPassword', path: '/forgotPassword', component: () => import(`pages/auth/forgotPassword.vue`), meta: { anonymousOnly: true } },
      { name: 'resetPassword', path: '/resetPassword', component: () => import(`pages/auth/forgotPassword.vue`), meta: { anonymousOnly: true } }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/authenticated.vue'),
    children: [
      // Authentication required
      { name: 'authenticatedLandingPage', path: '/auth', component: () => import(`pages/Index.vue`), meta: { requiresAuthentication: true } },
      { name: 'changePassword', path: '/auth', component: () => import(`pages/Index.vue`), meta: { requiresAuthentication: true } }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
