<template>
  <div class="row items-center" style="min-height:100vh">
    <div class="row col-12 justify-center">
      <div v-if="pageState === pageStates.pending">
        <q-spinner color="teal-4" size="40px" />
      </div>

      <div v-if="pageState === pageStates.validToken">
        Welcome
      </div>

      <div v-if="pageState === pageStates.invalidToken">
        Your token has expired please re-register
      </div>
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
      await this.$store.dispatch('auth/verify', this.$route.query.token)
      this.pageState = this.pageStates.validToken
    } catch (error) {
      this.pageState = this.pageStates.invalidToken
    }
  }
}
</script>
