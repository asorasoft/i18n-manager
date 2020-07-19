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
          {{$route.name === 'workspace' ? configs[$route.params.configIndex].projectName : 'Asora – Translator'}}
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
          :active="$route.name == 'workspace' && index.toString() == $route.params.configIndex"
          :key="config.localePath"
          @click="openWorkSpace(index)"
        >
          <q-item-section avatar :style="{minWidth: 0}">
            <q-icon :name="pathExist(config.localePath) ? 'history' : ''" :color="pathExist(config.localePath) ? '' : 'red'"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ config.projectName }}</q-item-label>
            <q-item-label caption>
              {{ config.localePath }}
            </q-item-label>
          </q-item-section>

          <q-popup-proxy context-menu>
            <q-list>
              <q-item @click="moveToTop(config)" clickable>
                <q-item-section :style="{minWidth: '24px'}">
                  <q-icon name="vertical_align_top"/>
                </q-item-section>
                <q-item-section :style="{minWidth: '100px'}">
                  Move to top
                </q-item-section>
              </q-item>
              <q-separator/>
              <q-item clickable>
                <q-item-section :style="{minWidth: '24px'}">
                  <q-icon name="settings"/>
                </q-item-section>
                <q-item-section :style="{minWidth: '100px'}">
                  Configs
                </q-item-section>
              </q-item>
              <q-separator/>
              <q-item clickable>
                <q-item-section class="text-red" :style="{minWidth: '24px'}">
                  <q-icon name="delete"/>
                </q-item-section>
                <q-item-section :style="{minWidth: '100px'}">
                  Delete
                </q-item-section>
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
const fs = require('fs');
import DrawerAction from 'components/DrawerAction.vue';

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
    moveToTop(config) {
      let activeConfig = null;
      if (this.$route.name === 'workspace') {
        activeConfig = this.configs[this.$route.params.configIndex];
      }
      this.configs = [config, ...this.configs.filter((c) => c !== config)];
      if (activeConfig !== null) {
        const updatedIndex = this.configs.indexOf(activeConfig).toString();
        if (updatedIndex !== this.$route.params.configIndex) {
          this.$router.push({name: 'workspace', params: {configIndex: updatedIndex}});
        }
      }
    },
    showNotify () {
      this.$q.notify((this.$q.platform.is.desktop ? 'Clicked' : 'Tapped') + ' on a context menu item.')
    },
    openWorkSpace(index) {
      if (this.$route.name != 'workspace' || this.$route.params.configIndex != index) {
        this.$router.push({name: 'workspace', params: {configIndex: index}}).catch(err => {})
      }
    },
    pathExist(path) {
      return fs.existsSync(path);
    },
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
