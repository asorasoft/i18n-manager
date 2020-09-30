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
