// generic errors
const {
  alreadyTaken,
  notFound,
  required
} = {
  alreadyTaken: '{field} has already been taken',
  notFound: '{field} was not found.',
  required: '{field} is required.'
}

export default {
  headings: {
    profileSettings: 'Profile Settings',
    changePassword: 'Change Password',
    forgotPassword: 'Forgot Password',
    notifications: 'Notifications',
    settings: 'Settings',
    navigation: 'Navigation',
    home: 'Home',
    logout: 'Logout'
  },

  toastMessages: {
    userSettingsUpdated: 'Your user settings have been updated.',
    passwordUpdated: 'Your password has been updated.',
    passwordResetExpired: 'Sorry your password reset has expired. Please request a new password reset.',
    checkYourEmail: 'Please check your email.',
    verifyEmail: 'Thank you for verifying your email.',
    expiredRegistration: 'Your token has expired please re-register.',
    notFound: 'Sorry, nothing here...'
  },

  buttons: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    save: 'Save',
    goBack: 'Go back',
    sendEmail: 'Send Email'
  },

  formFields: {
    email: 'Email',
    username: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    receiveEmailNotifications: 'Receive Email Notifications'
  },

  errors: {
    email: {
      required,
      email: 'Please enter a valid email.',
      alreadyTaken,
      notFound
    },
    username: {
      required,
      alphaNum: 'Please only enter alphanumeric characters',
      alreadyTaken,
      notFound
    },
    firstName: {
      required
    },
    lastName: {
      required
    },
    password: {
      required,
      incorrectPassword: 'Incorrect password.',
      notSameAsUsername: 'Password cannot match Username.',
      notSameAsEmail: 'Password cannot match Email.',
      sameAsPassword: 'Passwords must match.',
      passwordComplexity: 'Password does not match complexity requirements'
    },
    confirmPassword: {
      required
    },
    receiveEmailNotifications: {
      required
    }
  }
}
