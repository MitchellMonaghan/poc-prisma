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

          <q-popover>
            <q-list separator link>
              <q-item
                v-close-overlay
                @click.native="notificationViewed(notification)"
                v-for="(notification, index) in notifications" :key="index"
                :class="notification.viewed ? '' : `bg-blue-3`"
              >
                {{ notification.message }}
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
                Settings <q-item-side right icon="settings" />
              </q-item>

              <q-item v-close-overlay @click.native="logout">
                Logout <q-item-side right icon="fas fa-sign-out-alt" />
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
        <q-list-header>Essential Links</q-list-header>
        <q-item @click.native="openURL('http://quasar-framework.org')">
          <q-item-side icon="school" />
          <q-item-main label="Docs" sublabel="quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://github.com/quasarframework/')">
          <q-item-side icon="code" />
          <q-item-main label="GitHub" sublabel="github.com/quasarframework" />
        </q-item>
        <q-item @click.native="openURL('https://discord.gg/5TDhbDg')">
          <q-item-side icon="chat" />
          <q-item-main label="Discord Chat Channel" sublabel="https://discord.gg/5TDhbDg" />
        </q-item>
        <q-item @click.native="openURL('http://forum.quasar-framework.org')">
          <q-item-side icon="record_voice_over" />
          <q-item-main label="Forum" sublabel="forum.quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://twitter.com/quasarframework')">
          <q-item-side icon="rss feed" />
          <q-item-main label="Twitter" sublabel="@quasarframework" />
        </q-item>
        <q-item @click.native="logout">
          <q-item-side icon="fas fa-sign-out-alt" />
          <q-item-main label="Logout" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex'
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },

  async created () {
    await this.$store.dispatch('notification/getNotifications', this.user.id)
    await this.$store.dispatch('notification/subscribe', this.user.id)
  },

  computed: {
    ...mapState('auth', [
      'user'
    ]),

    ...mapState('notification', [
      'notifications'
    ]),

    unviewedNotifications () {
      return this.notifications.filter((notification) => {
        return !notification.viewed
      })
    }
  },

  methods: {
    openURL,

    async logout () {
      await this.$store.dispatch('auth/logout')
      this.$router.go({ name: 'login' })
    },

    async notificationViewed (notification) {
      notification.viewed = true
      await this.$store.dispatch('notification/updateNotification', notification)
    }
  }
}
</script>

<style>
</style>
