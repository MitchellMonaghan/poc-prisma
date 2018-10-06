<template>
  <div class="row justify-center">
    <div class="q-headline col-11 q-mt-md">Change username</div>

    <form class="col-11">
      <!-- Username -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${usernameLabel}:`"
          :error="$v.changeUsernameForm.username.$error"
          :error-label="usernameError"
        >
          <q-input
            v-model.trim="changeUsernameForm.username"
            :float-label="usernameLabel"
            @blur="$v.changeUsernameForm.username.$touch()"
            @keyup.enter="onSubmitChangeUsername"
          />
        </q-field>
      <!-- End username -->

      <div class="row q-pt-xl col-12 justify-end">
        <q-btn  @click="onSubmitChangeUsername" label="save" />
      </div>
    </form>

    <div class="q-headline col-11 q-mt-md">Change password</div>

    <form class="col-11">
      <!-- Password -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${passwordLabel}:`"
          :error="$v.changePasswordForm.password.$error"
          :error-label="passwordError"
        >
          <q-input
            type="password"
            v-model.trim="changePasswordForm.password"
            :float-label="passwordLabel"
            @blur="$v.changePasswordForm.password.$touch()"
            @keyup.enter="onSubmitChangePassword"
          />
        </q-field>
      <!-- End password -->

      <!-- Confirm password -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${confirmPasswordLabel}:`"
          :error="$v.changePasswordForm.confirmPassword.$error"
          :error-label="confirmPasswordError"
        >
          <q-input
            type="password"
            v-model.trim="changePasswordForm.confirmPassword"
            :float-label="confirmPasswordLabel"
            @blur="$v.changePasswordForm.confirmPassword.$touch()"
            @keyup.enter="onSubmitChangePassword"
          />
        </q-field>
      <!-- End confirm password -->

      <div class="row q-pt-xl col-12 justify-end">
        <q-btn  @click="onSubmitChangePassword" label="save" />
      </div>
    </form>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { required, alphaNum, not, sameAs, hasServerError } from 'src/validators'

export default {
  data () {
    return {
      usernameLabel: 'Username',
      usernameFieldKey: 'username',

      passwordLabel: 'Password',
      passwordFieldKey: 'password',

      confirmPasswordLabel: 'Confirm password',
      confirmPasswordFieldKey: 'confirmPassword',

      changeUsernameForm: {
        username: ''
      },

      changePasswordForm: {
        password: '',
        confirmPassword: ''
      },

      serverErrors: []
    }
  },

  computed: {
    usernameError () {
      return this.$displayError(this.$v.changeUsernameForm.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors)
    },

    passwordError () {
      return this.$displayError(this.$v.changePasswordForm.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
    },

    confirmPasswordError () {
      return this.$displayError(this.$v.changePasswordForm.confirmPassword, this.confirmPasswordLabel)
    }
  },

  methods: {
    async onSubmitChangeUsername () {
      this.serverErrors = []
      this.$v.changeUsernameForm.$touch()

      if (this.$v.changeUsernameForm.$error) {
        return
      }

      try {
        // TODO: Figure out what we call update user?
        // await this.$store.dispatch('auth/changePassword', { id: this.$store.state.auth.user.id, password: this.changeUsernameForm.password })
        this.resetChangeUsernameForm()

        Notify.create({
          color: 'positive',
          position: 'bottom-right',
          message: 'Your username has been updated'
        })
      } catch (error) {
        this.serverErrors = error.graphQLErrors
      }
    },

    async onSubmitChangePassword () {
      this.serverErrors = []
      this.$v.changePasswordForm.$touch()

      if (this.$v.changePasswordForm.$error) {
        return
      }

      try {
        await this.$graphql.auth.changePassword({ id: this.$store.state.auth.user.id, password: this.changePasswordForm.password })
        this.resetChangePasswordForm()

        Notify.create({
          color: 'positive',
          position: 'bottom-right',
          message: 'Your password has been updated'
        })
      } catch (error) {
        this.serverErrors = error.graphQLErrors
      }
    },

    async resetChangeUsernameForm () {
      this.changeUsernameForm.username = ''
      this.$v.changeUsernameForm.$reset()
    },

    async resetChangePasswordForm () {
      this.changePasswordForm.password = ''
      this.changePasswordForm.confirmPassword = ''
      this.$v.changePasswordForm.$reset()
    },

    onFieldBlur (fieldKey, formName) {
      this.serverErrors = []
      this.$v[formName][fieldKey].$touch()
    }
  },

  validations () {
    return {
      changeUsernameForm: {
        username: { required, alphaNum, hasServerError: hasServerError(this.serverErrors, this.usernameFieldKey) }
      },

      changePasswordForm: {
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
