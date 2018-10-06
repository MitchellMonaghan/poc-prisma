<template>
  <div class="row">
    <div class="row col-12 justify-center">
      <div class="row col-4" style="margin-top:20vh">
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
              @keyup.enter="onSubmit"
            />
          </q-field>
        <!-- End username -->

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
              @keyup.enter="onSubmit"
            />
          </q-field>
        <!-- End password -->

        <!-- Confirm password -->
          <q-field
            class="row col-12 q-mt-md"
            :label="$q.platform.is.mobile ? null : `${confirmPasswordLabel}:`"
            :error="$v.form.confirmPassword.$error"
            :error-label="confirmPasswordError"
          >
            <q-input
              type="password"
              v-model.trim="form.confirmPassword"
              :float-label="confirmPasswordLabel"
              @blur="$v.form.confirmPassword.$touch()"
              @keyup.enter="onSubmit"
            />
          </q-field>
        <!-- End confirm password -->

        <div class="row q-pt-xl col-12 justify-end">
          <q-btn  @click="onSubmit" label="register" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { required, alphaNum, email, not, sameAs, hasServerError } from 'src/validators'

export default {
  data () {
    return {
      usernameLabel: 'Username',
      usernameFieldKey: 'username',

      emailLabel: 'Email',
      emailFieldKey: 'email',

      passwordLabel: 'Password',
      passwordFieldKey: 'password',

      confirmPasswordLabel: 'Confirm password',
      confirmPasswordFieldKey: 'confirmPassword',

      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },

      serverErrors: []
    }
  },

  computed: {
    usernameError () {
      return this.$displayError(this.$v.form.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors)
    },

    emailError () {
      return this.$displayError(this.$v.form.email, this.emailLabel, this.emailFieldKey, this.serverErrors)
    },

    passwordError () {
      return this.$displayError(this.$v.form.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
    },

    confirmPasswordError () {
      return this.$displayError(this.$v.form.confirmPassword, this.confirmPasswordLabel)
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
        await this.$graphql.auth.registerUser(this.form)
        this.$router.push({ name: 'login' })
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
        username: { required, alphaNum, hasServerError: hasServerError(this.serverErrors, this.usernameFieldKey) },
        email: { required, email, hasServerError: hasServerError(this.serverErrors, this.emailFieldKey) },
        password: {
          required,
          notSameAsUsername: not(sameAs(this.usernameFieldKey)),
          notSameAsEmail: not(sameAs(this.emailFieldKey)),
          sameAsPassword: sameAs(this.confirmPasswordFieldKey),
          hasServerError: hasServerError(this.serverErrors, this.passwordFieldKey)
        },
        confirmPassword: { required }
      }
    }
  }
}
</script>
