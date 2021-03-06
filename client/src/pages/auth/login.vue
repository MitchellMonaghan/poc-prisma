<template>
  <page-transition class="row col flex flex-center fit" :enterActiveClass="$route.meta.enterActiveClass">
    <form class="col-lg-4 col-md-8 col-11">
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

            autocomplete="email"
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

            autocomplete="current-password"
          />
        </q-field>
      <!-- End password -->

      <div class="row q-pt-md col-12 justify-end">
        <router-link to="forgotPassword">{{$t('headings.forgotPassword')}}</router-link>
      </div>

      <div class="row q-pt-xl col-12 justify-end">
        <q-btn  @click="login" :label="$t('buttons.login')" />
      </div>
    </form>
  </page-transition>
</template>

<script>
import { required, hasServerError } from 'src/validators'

export default {
  data () {
    return {
      usernameLabel: this.$t('formFields.email'),
      usernameFieldKey: 'username',

      passwordLabel: this.$t('formFields.password'),
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
      return this.$t(this.$getErrorCode(this.$v.form.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors), { field: this.$t('formFields.email') })
    },

    passwordError () {
      return this.$getError(this.$t, this.$v.form.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
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
        await this.$graphql.auth.login(this.form)

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
