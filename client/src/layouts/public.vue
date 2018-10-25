<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="row justify-center relative-position">
        <page-transition class="col-11" :leaveActiveClass="$route.meta.leaveActiveClass">
          <router-view />
        </page-transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
