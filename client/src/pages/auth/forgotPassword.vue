<template>
  <div class="row items-center" style="min-height:100vh">
    <div class="row col-12 justify-center">
      <div class="row col-lg-4 col-md-8 col-11" v-if="pageState === pageStates.form || pageState === pageStates.invalidToken">
        <div v-if="pageState === pageStates.invalidToken">Sorry your password reset has expired. Please request a new password reset.</div>

        <!-- Email -->
          <q-field
            class="row col-12 q-mt-md"
            :label="$q.platform.is.mobile ? null : `${emailLabel}:`"
            :error="$v.form.email.$error"
            :error-label="emailError"
          >
            <q-input
              v-model.trim="form.email"
              :float-label="emailLabel"
              @blur="onFieldBlur(emailFieldKey)"
              @keyup.enter="onSubmit"
            />
          </q-field>
        <!-- End email -->

        <div class="row q-pt-xl col-12 justify-end">
          <q-btn  @click="onSubmit" label="Send Email" />
        </div>
      </div>

      <div class="row col-lg-4 col-md-8 col-11" v-if="pageState === pageStates.emailSent">
        <div>Please check your email.</div>

        <div class="row q-pt-xl col-12 justify-end">
          <q-btn  @click="$router.push('/')" label="Continue" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, hasServerError } from 'src/validators'

const pageStates = {

  form: 'form',
  emailSent: 'emailSent',
  invalidToken: 'invalidToken'
}

export default {
  data () {
    return {
      pageStates,
      pageState: pageStates.form,
      emailLabel: 'Email',
      emailFieldKey: 'email',

      form: {
        email: ''
      },

      serverErrors: []
    }
  },

  async created () {
    try {
      if (this.$route.query.token) {
        this.$store.commit('auth/setToken', this.$route.query.token)

        // Call refresh token to know if their current token is valid or not
        await this.$store.dispatch('auth/refreshToken')

        this.$router.push({ name: 'changePassword' })
      } else {
        this.pageState = pageStates.form
      }
    } catch (error) {
      this.pageState = pageStates.invalidToken
    }
  },

  computed: {
    emailError () {
      return this.$displayError(this.$v.form.email, this.emailLabel, this.emailFieldKey, this.serverErrors)
    }
  },

  methods: {
    async onSubmit () {
      this.serverErrors = []
      this.$v.form.$touch()

      if (this.$v.form.$error) {
        return
      }

      try {
        await this.$store.dispatch('auth/forgotPassword', this.form)

        this.pageState = this.pageStates.emailSent
      } catch (error) {
        this.serverErrors = error.graphQLErrors
      }
    },

    onFieldBlur (fieldKey) {
      this.serverErrors = []
      this.$v.form[fieldKey].$touch()
    }
  },

  validations () {
    return {
      form: {
        email: { required, email, hasServerError: hasServerError(this.serverErrors, this.emailFieldKey) }
      }
    }
  }
}
</script>
