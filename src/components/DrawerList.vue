<template>
  <div>
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
            <q-item @click="showConfirmRemoveProject = true; deleteConfig = config" clickable>
              <q-item-section class="text-red" :style="{minWidth: '24px'}">
                <q-icon name="delete"/>
              </q-item-section>
              <q-item-section :style="{minWidth: '100px'}">
                Remove
              </q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-item>
    </q-list>

    <q-dialog v-model="showConfirmRemoveProject" v-if="deleteConfig">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white"/>
          <span class="q-ml-sm">Remove project <strong>{{deleteConfig.projectName}}</strong>. Are you sure?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup/>
          <q-btn flat label="Yes, sure." color="primary" @click="onRemoveProject" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
const fs = require('fs');
import DrawerAction from 'components/DrawerAction.vue';

export default {
  name: "DrawerList",
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
    onRemoveProject() {
      let removeCurrentProject = false;
      if (this.$route.name === 'workspace' && this.configs[this.$route.params.configIndex] === this.deleteConfig) {
        removeCurrentProject = true;
      }
      this.$store.commit('translate/removeConfig', this.deleteConfig);
      if (removeCurrentProject) {
        this.$router.push({name: 'create-project'});
      }
    },
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
      if (this.$route.name !== 'workspace' || this.$route.params.configIndex != index) {
        this.$router.push({name: 'workspace', params: {configIndex: index}}).catch(err => {})
      }
    },
    pathExist(path) {
      return fs.existsSync(path);
    },
  },
  data () {
    return {
      deleteConfig: null,
      showConfirmRemoveProject: false,
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

<style scoped>

</style>
