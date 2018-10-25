<template>
  <page-transition class="fixed-center text-center" :enterActiveClass="$route.meta.enterActiveClass">
    <div class="col-lg-4 col-md-8 col-11">
      <p>
        <img
          src="~assets/sad.svg"
          style="width:30vw;max-width:150px;"
        >
      </p>
      <p class="text-faded">{{$t('toastMessages.notFound')}}<strong>(404)</strong></p>
      <q-btn
        color="secondary"
        style="width:200px;"
        @click="$router.push('/')"
      >{{$t('buttons.goBack')}}</q-btn>
    </div>
  </page-transition>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
