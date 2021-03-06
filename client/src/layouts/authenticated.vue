<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Quasar App
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div>
        </q-toolbar-title>

        <q-btn flat dense aria-label="notifications">
          <q-icon name="notifications" />
          <q-chip floating color="red" v-if="unviewedNotifications.length > 0">{{ unviewedNotifications.length }}</q-chip>

          <q-popover style="width: 400px">
            <q-list separator>
              <q-item>
                <q-item-side icon="notifications" inverted color="primary" />
                <q-item-main>
                  <q-item-tile>{{$t('headings.notifications')}}</q-item-tile>
                </q-item-main>
              </q-item>

              <q-item v-if="notifications.length === 0">
                <q-item-side inverted color="primary" />
                <q-item-main>
                  <q-item-tile label>{{$t('headings.noNotifications')}}</q-item-tile>
                </q-item-main>
              </q-item>

              <q-item
                v-if="notifications.length > 0"
                v-close-overlay
                @click.native="notificationViewed(notification)"
                v-for="(notification, index) in notifications" :key="index"
                :class="notification.viewed ? '' : `bg-blue-3`"
                link
              >
                <q-item-side :icon="notification.icon" inverted color="primary" />
                <q-item-main>
                  <q-item-tile label>{{$t(`notifications.${notification.notificationType}`, JSON.parse(notification.data))}}</q-item-tile>
                  <q-item-tile sublabel>{{date.formatDate(notification.createdAt, dateFormat)}}</q-item-tile>
                </q-item-main>
                <q-item-side>
                  <q-btn
                    flat
                    dense
                    round
                    @click.stop="deleteNotification(notification)"
                    aria-label="Delete"
                    color="red"
                  >
                    <q-icon name="close" />
                  </q-btn>
                </q-item-side>
              </q-item>
            </q-list>
          </q-popover>
        </q-btn>

        <q-btn
          flat
          dense
          round
        >
          <q-icon name="expand_more" />

          <q-popover>
            <q-list separator link>
              <q-item v-close-overlay @click.native="$router.push({ name: 'settings' })">
                {{$t('headings.settings')}} <q-item-side right icon="settings" />
              </q-item>

              <q-item v-close-overlay @click.native="logout">
                {{$t('buttons.logout')}} <q-item-side right icon="fas fa-sign-out-alt" />
              </q-item>
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-list-header>{{$t('headings.navigation')}}</q-list-header>
        <q-item @click.native="navigate({ name: 'authenticatedLandingPage' })">
          <q-item-side icon="home" />
          <q-item-main :label="$t('headings.home')" />
        </q-item>
        <q-item @click.native="logout">
          <q-item-side icon="fas fa-sign-out-alt" />
          <q-item-main :label="$t('headings.logout')" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <q-page class="row justify-center relative-position q-pb-xl">
        <page-transition class="col-11" :leaveActiveClass="$route.meta.leaveActiveClass">
          <router-view />
        </page-transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { date } from 'quasar'
import { mapGetters, mapState } from 'vuex'

export default {
  data () {
    return {
      date,
      dateFormat: 'h:mm A MMM D, YYYY',
      leftDrawerOpen: this.$q.platform.is.desktop,
      loading: true
    }
  },

  async created () {
    // I don't think user subscription is needed only the current
    // user is only to be making changes to these types of props
    // await this.$graphql.user.subscribeToUsers(this.user.id)

    // Permissions
    await this.$graphql.permission.subscribeToPermissions(this.user.id)

    // Notifications
    await this.$graphql.notification.getNotifications(this.user.id)
    await this.$graphql.notification.subscribeToNotifications(this.user.id)
  },

  computed: {
    ...mapState('auth', [
      'user'
    ]),

    ...mapGetters('notification', [
      'notifications'
    ]),

    unviewedNotifications () {
      return this.notifications.filter((notification) => {
        return !notification.viewed
      })
    }
  },

  methods: {
    async logout () {
      await this.$store.dispatch('auth/logout')
      this.$router.go({ name: 'login' })
    },

    async notificationViewed (notification) {
      notification.viewed = true
      this.$graphql.notification.updateNotification(notification)
      document.activeElement.blur()

      if (notification.linkTo) {
        this.$router.push(notification.linkTo)
      }
    },

    async deleteNotification (notification) {
      await this.$graphql.notification.deleteNotification(notification)
      document.activeElement.blur()
    },

    async navigate (route) {
      if (this.$q.platform.is.mobile) {
        this.leftDrawerOpen = false
      }

      this.$router.push(route)
    }
  }
}
</script>

<style>
</style>
