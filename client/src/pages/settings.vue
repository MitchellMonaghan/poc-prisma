<template>
  <div class="col-11">
    <div class="q-headline col-11 q-mt-md">{{$t('headings.profileSettings')}}</div>

    <q-field
      class="row col-11 q-mt-md"
      :label="$q.platform.is.mobile ? null : `${receiveEmailNotificationsLabel}:`"
    >
      <q-toggle
        v-model="updateUserForm.receiveEmailNotifications"
        :left-label="true"
        :label="$q.platform.is.mobile? receiveEmailNotificationsLabel: null"
        class="col justify-between"
        style="display: flex"
      />
    </q-field>

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
        <q-btn  @click="onSubmitUpdateUser" :label="saveLabel" />
      </div>
    </form>

    <div class="q-headline col-11 q-mt-md">{{$t('headings.changePassword')}}</div>

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
        <q-btn  @click="onSubmitChangePassword" :label="saveLabel" />
      </div>
    </form>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { required, alphaNum, sameAs, hasServerError } from 'src/validators'

export default {
  data () {
    return {
      receiveEmailNotificationsLabel: this.$t('formFields.receiveEmailNotifications'),

      usernameLabel: this.$t('formFields.username'),
      usernameFieldKey: 'username',

      firstNameLabel: this.$t('formFields.firstName'),
      firstNameFieldKey: 'firstName',

      lastNameLabel: this.$t('formFields.lastName'),
      lastNameFieldKey: 'lastName',

      passwordLabel: this.$t('formFields.password'),
      passwordFieldKey: 'password',

      confirmPasswordLabel: this.$t('formFields.confirmPassword'),
      confirmPasswordFieldKey: 'confirmPassword',

      saveLabel: this.$t('buttons.save'),

      updateUserForm: {
        receiveEmailNotifications: this.$store.state.auth.user.receiveEmailNotifications,

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
      return this.$getError(this.$t, this.$v.updateUserForm.username, this.usernameLabel, this.usernameFieldKey, this.serverErrors)
    },

    firstNameError () {
      return this.$getError(this.$t, this.$v.updateUserForm.firstName, this.firstNameLabel, this.firstNameFieldKey, this.serverErrors)
    },

    lastNameError () {
      return this.$getError(this.$t, this.$v.updateUserForm.lastName, this.lastNameLabel, this.lastNameFieldKey, this.serverErrors)
    },

    passwordError () {
      return this.$getError(this.$t, this.$v.changePasswordForm.password, this.passwordLabel, this.passwordFieldKey, this.serverErrors)
    },

    confirmPasswordError () {
      return this.$getError(this.$t, this.$v.changePasswordForm.confirmPassword, this.confirmPasswordLabel, this.confirmPasswordFieldKey)
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
        await this.$graphql.user.updateUser(this.$store.state.auth.user.id, this.updateUserForm)
        this.resetUpdateUserForm()

        Notify.create({
          color: 'positive',
          position: 'bottom-right',
          message: this.$t('toastMessages.userSettingsUpdated')
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
          message: this.$t('toastMessages.passwordUpdated')
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
          sameAsPassword: sameAs(this.confirmPasswordFieldKey),
          hasServerError: hasServerError(this.serverErrors, this.passwordFieldKey)
        },
        confirmPassword: { required }
      }
    }
  }
}
</script>
