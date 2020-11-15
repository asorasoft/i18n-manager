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
          {{ onWorkspace ? configs[$route.params.configIndex].projectName : 'Asora – Translator' }}
        </q-toolbar-title>

        <q-btn v-if="onWorkspace" @click="onEditConfig()" icon="settings" round dense flat>
          <q-tooltip>
            Update project settings
          </q-tooltip>
        </q-btn>
        <q-btn v-if="onWorkspace" @click="onUpdateCookie()" icon="mdi-cookie" round dense flat>
          <q-tooltip>
            Set Google translate cookie
          </q-tooltip>
        </q-btn>
        <q-btn v-if="onWorkspace" @click="listKeys()" icon="mdi-clipboard-list" round dense flat>
          <q-tooltip>
            List all keys
          </q-tooltip>
        </q-btn>
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

    <q-drawer
      v-if="onWorkspace"
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      side="right"
      content-class="bg-grey-1"
    >
      <div>
        <q-input
          ref="filter"
          filled
          v-model="filter"
          label="Search translation"
        >
          <template v-slot:append>
            <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
          </template>
        </q-input>
        <q-tree
          :key="configIndex"
          :nodes="tree"
          :filter="filter"
          :filter-method="treeFilterMethod"
          node-key="label"
          selected-color="primary"
          :default-expand-all="false"
        >
          <template v-slot:default-header="prop">
            <div v-if="prop.node.children.length > 0" class="row items-center">
              <div class="text-weight-bold text-primary">{{ prop.node.label }}</div>
            </div>
              <q-btn v-else no-caps flat align="left" class="full-width" @click="setCurrentKey(prop.node.value)">{{ prop.node.label }}</q-btn>
          </template>
        </q-tree>
      </div>
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
import { EventBus } from '../utils/event_bus.js';

export default {
  name: 'MainLayout',
  components: {
    DrawerList
  },
  data() {
    return {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      cookiePrompt: false,
      cookie: '',
      tree: [],
      filter: ''
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
    },
    onWorkspace() {
      return this.$route.name === 'workspace'
    },
    configIndex() {
      return this.$route.params.configIndex
    },
  },
  methods: {
    setCurrentKey(key) {
      EventBus.$emit("SET_CURRENT_KEY", key)
    },
    updateTree() {
      if (this.configIndex === undefined) {
        this.tree = []; return
      }
      const primaryLanguage = this.$store.state.translate.configs[this.configIndex].primaryLanguage

      if (!primaryLanguage) {
        this.tree = []; return
      }
      const translations = this.$store.state.translate.translations
      if (!translations) {
        this.tree = []; return
      }
      const primaryTranslation = translations[primaryLanguage]
      if (!primaryTranslation) {
        this.tree = []; return
      }
      this.tree = this.convertObjectToTree(primaryTranslation)
      console.log(this.tree)
    },
    convertObjectToTree(object) {
      const tree = []
      const objectToBranch = (object, root, prefix) => {
        for (let key in object) {
          if (typeof object[key] == 'object') {
            let newNode = {
              label: key,
              value: prefix + key,
              children: [],
            }
            root.push(newNode)
            objectToBranch(object[key], newNode.children, newNode.value + '.')
          } else {
            let translationValues = this.$store.getters['translate/getTranslationFromKey'](prefix + key);
            root.push({
              label: key,
              value: prefix + key,
              searchMeta: Object.values(translationValues).filter(v => v !== null).join(','),
              children: [],
            })
          }
        }
      }
      objectToBranch(object, tree, "")
      return tree
    },
    setCookie() {
      this.$store.dispatch("translate/updateGoogleTranslateCookie", this.cookie)
      this.cookiePrompt = false;
    },
    onUpdateCookie() {
      this.cookie = this.$store.getters['translate/googleTranslateCookie'];
      this.cookiePrompt = true;
    },
    onEditConfig() {
      try {
        this.$router.push({name: 'edit-config', params: {configIndex: this.configIndex}})
      } catch (e) {
        this.$router.replace({name: 'edit-config', params: {configIndex: this.configIndex}, query: {try: '1'}})
      }
    },
    listKeys() {
      this.rightDrawerOpen = !this.rightDrawerOpen
    },
    handleTranslationUpdate() {
      this.updateTree()
    },
    treeFilterMethod (node, filter) {
      const filt = filter.toLowerCase()
      const matchValue = node.value && node.value.toLowerCase().indexOf(filt) > -1
      const matchMeta = node.searchMeta && node.searchMeta.toLowerCase().indexOf(filt) > -1
      return matchValue || matchMeta
    },
    resetFilter () {
      this.filter = ''
      this.$refs.filter.focus()
    }
  },
  mounted() {
    this.updateTree()
  },
  created() {
    EventBus.$on("TRANSLATION_UPDATED", this.handleTranslationUpdate)
  },
  destroyed() {
    EventBus.$off("TRANSLATION_UPDATED", this.handleTranslationUpdate)
  }
}
</script>
