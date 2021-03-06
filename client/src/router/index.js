import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
import graphql from 'src/graphql'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const globalAuthGuard = async function (to, from, next) {
  let userIsAuthenticated = graphql.store.state.auth.user

  if (!userIsAuthenticated) {
    try {
      await graphql.auth.getCurrentUser()
      userIsAuthenticated = graphql.store.state.auth.user
    } catch (error) {
      await graphql.store.dispatch('auth/setToken')
    }
  }

  if (to.matched.some(record => record.meta.anonymousOnly)) {
    if (userIsAuthenticated) {
      next({
        name: 'authenticatedLandingPage'
      })

      return
    }

    next()
  } else if (to.matched.some(record => record.meta.requiresAuthentication)) {
    // this route requires auth, check if logged in
    if (userIsAuthenticated) {
      next()
      return
    }

    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  }

  next()
}

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  // Inform Google Analytics
  Router.beforeEach((to, from, next) => {
    /*
    if (typeof ga !== 'undefined') {
      ga('set', 'page', to.path)
      ga('send', 'pageview')
    }
    */

    globalAuthGuard(to, from, next)
  })

  return Router
}
