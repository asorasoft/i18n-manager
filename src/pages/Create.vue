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
      </div>
    </q-form>
  </div>
</template>

<script>
  const fs = require('fs');
  const electron = require('electron')

  export default {
    name: 'PageCreate',
    data() {
      return {
        projectName: '',
        localePath: '',
        primaryLanguage: '',
        foundFiles: [],
        languageCodes: {},
        availableLanguages: ["ca","ar","fa","ps","en","sq","hy","pt","es","fr","ru","sm","de","nl","pap","sv","az","bs","hr","sr","bn","bg","ms","qu","gn","ay","dz","no","tn","be","sg","it","rm","rar","zh-hans","el","tr","cs","so","aa","da","et","ti","ast","eu","gl","am","om","fi","se","fo","ga","cy","gd","kw","ka","kl","ch","zh-hant","ht","hu","id","he","hi","ku","is","ja","sw","ky","km","ko","lo","si","ta","st","lt","lb","lv","zgh","ro","uk","srp","mg","mh","mk","my","mn","mt","mfe","ny","sf","pih","nb","nn","na","niu","mi","tpi","ho","tl","ur","pl","pau","sov","tox","sr-Latn","rw","crs","sl","sk","ss","th","tg","tkl","tet","tk","kaa","vi","bi","af","xh","zu","sn","nd"],
      }
    },
    computed: {
      configs() {
        return this.$store.getters['translate/configs'];
      },
      existingConfig() {
        let found = this.configs.filter(c => c.localePath == this.localePath);
        return found.length > 0 ? found[0] : null;
      }
    },
    watch: {
      foundFiles() {
        this.languageCodes = {};
        this.foundFiles.forEach((file) => {
          const lang = file.split('.')[0].toLowerCase();
          this.$set(this.languageCodes, file, this.availableLanguages.includes(lang) ? lang : '');
        });
      }
    },
    methods: {
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
        const files = fs.readdirSync(this.localePath).filter((fileName) => fileName.endsWith('.json'))
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
          this.$router.push({name: 'workspace', parmas: {configIndex: 0}});
        } else {
          this.$q.notify({
            message: 'Please select a primary langauge.',
          });
        }
      }
    }
  }
</script>
