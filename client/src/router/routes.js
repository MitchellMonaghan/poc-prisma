
const routes = [
  {
    path: '/',
    component: () => import('layouts/public.vue'),
    children: [
      // Anonymous only
      {
        path: '',
        component: () => import('pages/index.vue'),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'login',
        path: '/login',
        component: () => import(`pages/auth/login`),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'register',
        path: '/register',
        component: () => import(`pages/auth/register`),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'verifyEmail',
        path: '/verifyEmail',
        component: () => import(`pages/auth/verifyEmail.vue`),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'forgotPassword',
        path: '/forgotPassword',
        component: () => import(`pages/auth/forgotPassword.vue`),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'resetPassword',
        path: '/resetPassword',
        component: () => import(`pages/auth/forgotPassword.vue`),
        meta: {
          anonymousOnly: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/authenticated.vue'),
    children: [
      // Authentication required
      {
        name: 'authenticatedLandingPage',
        path: '/auth',
        component: () => import(`pages/index.vue`),
        meta: {
          requiresAuthentication: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'settings',
        path: '/auth/settings',
        component: () => import(`pages/settings.vue`),
        meta: {
          requiresAuthentication: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      },
      {
        name: 'changePassword',
        path: '/auth/settings',
        component: () => import(`pages/settings.vue`),
        meta: {
          requiresAuthentication: true,
          enterActiveClass: 'fadeInDown',
          leaveActiveClass: 'fadeOutDown'
        }
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/error404.vue'),
    meta: {
      enterActiveClass: 'fadeInDown',
      leaveActiveClass: 'fadeOutDown'
    }
  })
}

export default routes
