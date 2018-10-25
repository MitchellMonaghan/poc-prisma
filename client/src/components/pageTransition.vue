<template>
  <div>
    <transition
      :enter-active-class="enterActiveClass ? `animated ${enterActiveClass}` : ''"
      :leave-active-class="leaveActiveClass ? `animated ${leaveActiveClass}` : ''"
      mode="out-in"
    >
      <slot v-if="!loadingState"></slot>
    </transition>

    <q-inner-loading color="primary" :visible="loadingState">
    </q-inner-loading>
  </div>
</template>

<script>
export default {
  props: {
    localLoading: Boolean,
    enterActiveClass: String,
    leaveActiveClass: String
  },

  data () {
    return {
      loadingState: true
    }
  },

  async mounted () {
    if (!this.$options.propsData.hasOwnProperty('localLoading')) {
      this.loadingState = false
    }
  },

  methods: {
    async loading () {
      this.loadingState = true
    },

    async doneLoading () {
      this.loadingState = false
    }
  }
}
</script>
