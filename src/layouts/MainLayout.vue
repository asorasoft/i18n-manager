<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $route.name === 'workspace' ? configs[$route.params.configIndex].projectName : 'Asora – Translator' }}
        </q-toolbar-title>

        <q-btn v-if="$route.name === 'workspace'" @click="onEditConfig($route.params.configIndex)" icon="settings" round dense flat></q-btn>
        <q-btn v-if="$route.name === 'workspace'" @click="onUpdateCookie()" icon="mdi-cookie" round dense flat></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <drawer-list></drawer-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-dialog v-model="cookiePrompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Google translate request cookie</div>
          <div class="text-weight-thin" style="margin-top: 10px;">Go to <a href="https://translate.google.com" target="_blank">translate.google.com</a>, inspect <code>Network</code>, copy <code>cookie</code> value from <code>Request Headers</code></div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="cookie" placeholder="Place cookie here" autofocus @keyup.enter="setCookie()" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Update" @click="setCookie()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import DrawerList from "components/DrawerList";

export default {
  name: 'MainLayout',
  components: {
    DrawerList
  },
  data() {
    return {
      leftDrawerOpen: false,
      cookiePrompt: false,
      cookie: '',
    }
  },
  computed: {
    configs: {
      get() {
        return this.$store.state.translate.configs
      },
      set(val) {
        this.$store.commit('translate/loadConfigs', val)
      }
    }
  },
  methods: {
    setCookie() {
      this.$store.dispatch("translate/updateGoogleTranslateCookie", this.cookie)
      this.cookiePrompt = false;
    },
    onUpdateCookie() {
      this.cookie = this.$store.getters['translate/googleTranslateCookie'];
      this.cookiePrompt = true;
    },
    onEditConfig(configIndex) {
      try {
        this.$router.push({name: 'edit-config', params: {configIndex: configIndex}})
      } catch (e) {
        this.$router.replace({name: 'edit-config', params: {configIndex: configIndex}, query: {try: '1'}})
      }
    },

  },
}
</script>
