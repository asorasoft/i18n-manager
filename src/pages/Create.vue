<template>
  <div class="q-pa-md">
    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <div>Name of project</div>
      <q-input
        filled
        label="Project name"
        v-model="projectName"
        :rules="[val => !!val || 'Please give a name']"
      ></q-input>

      <div>Translation absolute path</div>
      <q-input
        filled
        label="Absolute path"
        v-model="localePath"
        @blur="onBlurPath"
        :rules="[val => !!val || 'Must select folder that store translation file']"
      >
        <template v-slot:after>
          <q-btn @click="pickFolder" round dense flat icon="folder" />
        </template>
      </q-input>

      <div v-if="foundFiles.length > 0">Primary language</div>
      <div class="row">
        <div v-for="file in foundFiles" :key="file" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <q-radio v-model="primaryLanguage"
            :val="file"
            :rules="[val => !!val || 'Choose a primary language']">
            {{ file.split('.')[0].toUpperCase() }}
          </q-radio>
        </div>
      </div>

      <div v-if="foundFiles.length > 0">Language codes</div>
      <div class="row">
        <div v-for="(file) in foundFiles" :key="'map-' + file" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <div style="padding: 10px;">
            <q-input
              filled
              :key="'code-' + file"
              v-model="languageCodes[file]"
              :label="file"
              :rules="[val => !!val || 'Define language code']"
            ></q-input>
          </div>
        </div>
      </div>

      <div>
        <q-btn :disabled="foundFiles.length === 0"
          :label="existingConfig != null ? `Update on ${existingConfig.projectName}` : 'Submit'"
          type="submit"
          :color="existingConfig != null ? 'warning': 'primary'"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm"/>
        <q-btn class="float-right" v-if="this.$route.name === 'edit-config'" type="cancel" flat color="negative" @click="$router.back()">Cancel</q-btn>
      </div>
    </q-form>
  </div>
</template>

<script>
  const fs = require('fs');
  const electron = require('electron')
  import translate from "../plugins/translate.js";

  export default {
    name: 'PageCreate',
    data() {
      return {
        projectName: '',
        localePath: '',
        primaryLanguage: '',
        foundFiles: [],
        languageCodes: {},
      }
    },
    computed: {
      configs() {
        return this.$store.getters['translate/configs'];
      },
      existingConfig() {
        let found = this.configs.filter(c => c.localePath === this.localePath);
        return found.length > 0 ? found[0] : null;
      }
    },
    watch: {
      foundFiles() {
        if (this.$route.name === 'create-project') {
          this.languageCodes = {};
          this.foundFiles.forEach((file) => {
            const lang = file.split('.')[0].toLowerCase();
            this.$set(this.languageCodes, file, translate.languages.isSupported(lang) ? lang : '');
          });
        }
      },
      '$route'() {
        this.onRouteUpdate()
      }
    },
    created() {
      this.onRouteUpdate()
    },
    methods: {
      onRouteUpdate() {
        if (this.$route.name === 'create-project') {
          this.projectName = ''
          this.localePath = ''
          this.primaryLanguage = ''
          this.foundFiles = []
          this.languageCodes = {}
        } else if (this.$route.name === 'edit-config') {
          const configData = this.configs[this.$route.params.configIndex]
          this.projectName = configData.projectName
          this.localePath = configData.localePath
          this.primaryLanguage = configData.primaryLanguage
          this.foundFiles = Object.keys(configData.languageCodes)
          this.languageCodes = configData.languageCodes
          this.onBlurPath()
        }
      },
      async pickFolder() {
        const result = await electron.remote.dialog.showOpenDialog({
          properties: ['openDirectory']
        });
        if (!result.canceled) {
          this.localePath = result.filePaths[0];
          this.checkFoundFile()
        }
      },
      checkFoundFile() {
        const files = this.$helpers.getJsonFilesInFolder(this.localePath)
        if (files.length === 0) {
          this.foundFiles = [];
        } else {
          this.foundFiles = files;
        }
      },
      onBlurPath() {
        if (!fs.existsSync(this.localePath)) {
          this.foundFiles = [];
          return;
        }
        if (fs.lstatSync(this.localePath).isDirectory()) {
          this.checkFoundFile();
        } else {
          this.foundFiles = [];
        }
      },
      onReset() {
        this.projectName = '';
        this.localePath = '';
        this.primaryLanguage = '';
      },
      onSubmit() {
        if (this.projectName && this.localePath && this.primaryLanguage) {
          this.$store.dispatch('translate/saveConfig', {
            projectName: this.projectName,
            localePath: this.localePath,
            primaryLanguage: this.primaryLanguage,
            languageCodes: this.languageCodes
          });
          this.$router.push({name: 'workspace', params: {configIndex: '0'}});
        } else {
          this.$q.notify({
            message: 'Please select a primary langauge.',
          });
        }
      }
    },
  }
</script>
