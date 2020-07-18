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
          Projects
        </q-item-label>
        <drawer-action
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <q-separator />

        <q-item
          clickable
          v-for="(config, index) in configs"
          :key="config.localePath"
          @click="openWorkSpace(index)"
        >
          <q-item-section avatar>
            <q-icon name="history"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ config.projectName }}</q-item-label>
            <q-item-label caption>
              {{ config.localePath }}
            </q-item-label>
          </q-item-section>

          <q-popup-proxy context-menu>
            <q-list>
              <q-item clickable>
                <q-item-section>
                  <q-icon name="settings"/>
                </q-item-section>
                <q-item-section>
                  Configs
                </q-item-section>
                <q-item-section/>
              </q-item>
              <q-separator/>
              <q-item clickable>
                <q-item-section class="text-red">
                  <q-icon name="delete"/>
                </q-item-section>
                <q-item-section>
                  Delete
                </q-item-section>
                <q-item-section/>
              </q-item>
            </q-list>
          </q-popup-proxy>


        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import DrawerAction from 'components/DrawerAction.vue'

export default {
  name: 'MainLayout',
  components: {
    DrawerAction
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
  methods: {
    showNotify () {
      this.$q.notify((this.$q.platform.is.desktop ? 'Clicked' : 'Tapped') + ' on a context menu item.')
    },
    openWorkSpace(index) {
      this.$router.push({name: 'workspace', params: {configIndex: index}}).catch(err => {})
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
      ]
    }
  }
}
</script>
