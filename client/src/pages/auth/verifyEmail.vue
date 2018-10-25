<template>
  <page-transition class="fixed-center text-center" :enterActiveClass="$route.meta.enterActiveClass">
    <div class="col-lg-4 col-md-8 col-11">
      <div v-if="pageState === pageStates.pending">
        <q-spinner color="primary" size="40px" />
      </div>

      <div v-if="pageState === pageStates.validToken">
        {{$t('toastMessages.verifyEmail')}}
      </div>

      <div v-if="pageState === pageStates.invalidToken">
        {{$t('toastMessages.expiredRegistration')}}
      </div>
    </div>
  </page-transition>
</template>

<script>
const pageStates = {
  pending: 'pending',
  validToken: 'validToken',
  invalidToken: 'invalidToken'
}

export default {
  data () {
    return {
      pageStates,
      pageState: pageStates.pending
    }
  },

  async created () {
    try {
      await this.$graphql.auth.verifyEmail(this.$route.query.token)
      this.pageState = this.pageStates.validToken
      this.$router.push({ name: 'authenticatedLandingPage' })
    } catch (error) {
      this.pageState = this.pageStates.invalidToken
    }
  }
}
</script>
