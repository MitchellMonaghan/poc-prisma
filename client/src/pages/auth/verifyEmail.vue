<template>
  <div class="flex flex-center row col-12">
    <div v-if="pageState === pageStates.pending">
      <q-spinner color="teal-4" size="40px" />
    </div>

    <div v-if="pageState === pageStates.validToken">
      {{$t('toastMessages.verifyEmail')}}
    </div>

    <div v-if="pageState === pageStates.invalidToken">
      {{$t('toastMessages.expiredRegistration')}}
    </div>
  </div>
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
