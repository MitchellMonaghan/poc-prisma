<template>
  <div class="row justify-center">
    <div class="q-headline col-11 q-mt-md">Profile Settings</div>

    <form class="col-11">
      <!-- Username -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${usernameLabel}:`"
          :error="$v.updateUserForm.username.$error"
          :error-label="usernameError"
        >
          <q-input
            v-model.trim="updateUserForm.username"
            :float-label="usernameLabel"
            @blur="$v.updateUserForm.username.$touch()"
            @keyup.enter="onSubmitUpdateUser"
          />
        </q-field>
      <!-- End username -->

      <!-- First name -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${firstNameLabel}:`"
          :error="$v.updateUserForm.firstName.$error"
          :error-label="firstNameError"
        >
          <q-input
            v-model.trim="updateUserForm.firstName"
            :float-label="firstNameLabel"
            @blur="$v.updateUserForm.firstName.$touch()"
            @keyup.enter="onSubmitUpdateUser"
          />
        </q-field>
      <!-- End first name -->

      <!-- Last name -->
        <q-field
          class="row col-12 q-mt-md"
          :label="$q.platform.is.mobile ? null : `${lastNameLabel}:`"
          :error="$v.updateUserForm.lastName.$error"
          :error-label="lastNameError"
        >
          <q-input
            v-model.trim="updateUserForm.lastName"
            :float-label="lastNameLabel"
            @blur="$v.updateUserForm.lastName.$touch()"
            @keyup.enter="onSubmitUpdateUser"
          />
        </q-field>
      <!-- End last name -->

      <div class="row q-pt-xl col-12 justify-end">
        <q-btn  @click="onSubmitUpdateUser" label="save" />
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

      firstNameLabel: 'First Name',
      firstNameFieldKey: 'firstName',

      lastNameLabel: 'Last Name',
      lastNameFieldKey: 'lastName',

      passwordLabel: 'Password',
      passwordFieldKey: 'password',

      confirmPasswordLabel: 'Confirm password',
      confirmPasswordFieldKey: 'confirmPassword',

      updateUserForm: {
        username: this.$store.state.auth.user.username,
        firstName: this.$store.state.auth.user.firstName,
        lastName: this.$store.state.auth.user.lastName
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
      return this.$displayError(this.$v.updateUserForm.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors)
    },

    firstNameError () {
      return this.$displayError(this.$v.updateUserForm.firstName, this.firstNameLabel, this.firstNameFieldKey, this.serverErrors)
    },

    lastNameError () {
      return this.$displayError(this.$v.updateUserForm.lastName, this.lastNameLabel, this.lastNameFieldKey, this.serverErrors)
    },

    passwordError () {
      return this.$displayError(this.$v.changePasswordForm.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
    },

    confirmPasswordError () {
      return this.$displayError(this.$v.changePasswordForm.confirmPassword, this.confirmPasswordLabel)
    }
  },

  methods: {
    async onSubmitUpdateUser () {
      this.serverErrors = []
      this.$v.updateUserForm.$touch()

      if (this.$v.updateUserForm.$error) {
        return
      }

      try {
        document.activeElement.blur()
        await this.$graphql.user.updateUser(this.$store.state.auth.user.id, {
          username: this.updateUserForm.username,
          firstName: this.updateUserForm.firstName,
          lastName: this.updateUserForm.lastName
        })

        this.resetUpdateUserForm()

        Notify.create({
          color: 'positive',
          position: 'bottom-right',
          message: 'Your user settings have been updated'
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
        document.activeElement.blur()
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

    async resetUpdateUserForm () {
      this.updateUserForm.username = this.$store.state.auth.user.username
      this.updateUserForm.firstName = this.$store.state.auth.user.firstName
      this.updateUserForm.lastName = this.$store.state.auth.user.lastName
      this.$v.updateUserForm.$reset()
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
      updateUserForm: {
        username: { required, alphaNum, hasServerError: hasServerError(this.serverErrors, this.usernameFieldKey) },
        firstName: { required, hasServerError: hasServerError(this.serverErrors, this.firstName) },
        lastName: { required, hasServerError: hasServerError(this.serverErrors, this.lastName) }
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
