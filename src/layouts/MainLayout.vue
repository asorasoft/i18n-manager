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
          Asora – Translator
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

export default {
  name: 'MainLayout',
  components: {
    EssentialLink
  },
  computed: {
    configs: {
      get () {
        return this.$store.state.translate.configs
      },
      set (val) {
        this.$store.commit('translate/loadConfigs', val)
      }
    }
  },
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: [
        {
          title: 'New Project',
          caption: 'Create new translation',
          icon: 'add',
          routeName: 'create-project'
        },
        {
          title: 'VSHOP App',
          caption: 'Project for vshop',
          icon: 'history',
          routeName: 'create-project'
        },
        {
          title: 'CashHero',
          caption: 'Loan provider',
          icon: 'history',
          routeName: 'create-project'
        },
        {
          title: 'CCInspection',
          caption: 'Cambodia Construction Inspection',
          icon: 'history',
          routeName: 'create-project'
        },
      ]
    }
  }
}
</script>
