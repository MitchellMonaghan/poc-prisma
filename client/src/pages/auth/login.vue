<template>
  <div class="row items-center" style="min-height:100vh">
    <div class="row col-12 justify-center">
      <div class="row col-lg-4 col-md-8 col-11">
        <!-- Username -->
          <q-field
            class="row col-12 q-mt-md"
            :label="$q.platform.is.mobile ? null : `${usernameLabel}:`"
            :error="$v.form.username.$error"
            :error-label="usernameError"
          >
            <q-input
              v-model.trim="form.username"
              :float-label="usernameLabel"
              @blur="onFieldBlur(usernameFieldKey)"
              @keyup.enter="login"
            />
          </q-field>
        <!-- End username -->

        <!-- Password -->
          <q-field
            class="row col-12 q-mt-md"
            :label="$q.platform.is.mobile ? null : `${passwordLabel}:`"
            :error="$v.form.password.$error"
            :error-label="passwordError"
          >
            <q-input
              type="password"
              v-model.trim="form.password"
              :float-label="passwordLabel"
              @blur="onFieldBlur(passwordFieldKey)"
              @keyup.enter="login"
            />
          </q-field>
        <!-- End password -->

        <div class="row q-pt-md col-12 justify-end">
          <router-link to="forgotPassword">Forgot Password</router-link>
        </div>

        <div class="row q-pt-xl col-12 justify-end">
          <q-btn  @click="login" label="login" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, hasServerError } from 'src/validators'

export default {
  data () {
    return {
      usernameLabel: 'Email',
      usernameFieldKey: 'username',

      passwordLabel: 'Password',
      passwordFieldKey: 'password',

      form: {
        username: '',
        password: ''
      },

      serverErrors: []
    }
  },

  computed: {
    usernameError () {
      return this.$displayError(this.$v.form.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors)
    },

    passwordError () {
      return this.$displayError(this.$v.form.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
    }
  },

  methods: {
    async login () {
      this.serverErrors = []
      this.$v.form.$touch()

      if (this.$v.form.$error) {
        return
      }

      try {
        await this.$store.dispatch('auth/login', this.form)

        if (this.$route.query.redirect) {
          this.$router.push(this.$route.query.redirect)
        } else {
          this.$router.push({ name: 'authenticatedLandingPage' })
        }
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
        username: { required, hasServerError: hasServerError(this.serverErrors, this.usernameFieldKey) },
        password: { required, hasServerError: hasServerError(this.serverErrors, this.passwordFieldKey) }
      }
    }
  }
}
</script>
