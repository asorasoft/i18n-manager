<template>
  <q-page :key="$route.params.configIndex" padding>
    <div class="q-pa-md">
      <q-form class="q-gutter-md">
        <div class="row" :style="{height: '25.72px', marginBottom: '30px'}">
          <div v-show="existingKeys().map(k => k.join('.')).includes(displayKey)">
            <q-btn @click="showConfirmDeleteModel = true" class="q-mr-sm" size="sm" color="red" icon="delete"
                   label="delete"></q-btn>
            <q-btn @click="showChangeKeyModel = true; newKeyChangeModel = displayKey" size="sm" color="warning"
                   icon="edit" label="change key"></q-btn>
          </div>
          <div class="absolute-right">
            <q-btn :disable="currentKeyStatus.disabled"
                   :color="currentKeyStatus.color"
                   :icon="currentKeyStatus.icon"
                   :label="currentKeyStatus.label"
                   @click="currentKeyStatus.onClick"></q-btn>
          </div>
        </div>
        <q-input
          filled
          autofocus
          placeholder="For example: button.click"
          ref="inputKey"
          @keydown.ctrl.c="!$q.platform.is.mac ? onCopy() : null"
          @keydown.meta.c="$q.platform.is.mac ? onCopy() : null"
          @keypress="onKeyPressed"
          @keydown.tab="onPressTab"
          @input="onInputKey"
          @blur="updateFinalKey"
          v-model="displayKey"
          hint="Translation key"
        >
          <template v-slot:before>
            <q-btn round dense flat no-caps>
              <strong @click="convertToCamelCase" v-if="isSnakeCase">aB</strong>
              <strong @click="convertToSnakeCase" v-else>a_b</strong>
            </q-btn>
          </template>
          <template v-slot:after>
            <div :style="{width: '80px'}">
              <q-btn v-show="true" @click="onCopy" round dense flat icon="content_copy">
                <q-tooltip>
                  Copy current key ({{ $q.platform.is.mac ? 'CMD' : 'Ctrl' }} + C)
                </q-tooltip>
              </q-btn>
              <q-btn v-show="true" @click="translateAll" round dense flat icon="g_translate">
                <q-tooltip>
                  Auto translate all (ALT + Enter)
                </q-tooltip>
              </q-btn>
            </div>
          </template>
        </q-input>
        <q-scroll-area
          horizontal
          :vertical="false"
          :style="{
            height: '60px'
          }"
        >
          <div ref="suggestionContainer" class="row no-wrap">
            <q-chip
              :color="index === suggestionIndex ? 'primary' : ''"
              :text-color="index === suggestionIndex ? 'white' : ''"
              clickable
              @click="chooseKey(suggestion)"
              class="q-ma-sm"
              v-for="(suggestion, index) in suggestionList"
              :key="suggestion[suggestion.length -1]">
              {{ suggestion[suggestion.length - 1] }}
            </q-chip>
          </div>
        </q-scroll-area>

        <q-input type="textarea"
                 rows="3"
                 v-for="file in translationFiles"
                 :placeholder="$helpers.getNativeLanguage(getLanguageCode(file))"
                 :key="file"
                 filled
                 v-model="translationModels[file]"
                 :hint="typeof existingKeyValue[file] === 'string' ? existingKeyValue[file] : ''"
        >
          <template v-slot:before>
            <div :style="{width: '80px'}">
              <div>
                <span
                  :style="{fontSize: '14px'}">{{ file.split('.')[0].toUpperCase() }} ({{
                    getLanguageCode(file)
                  }})</span>
              </div>
              <div>
                <span
                  :class="['text-green', 'text-orange', 'text-red', 'text-red', 'text-red'][getStatusText(keyStatuses[file]).code]"
                  :style="{fontSize: '12px'}"
                >
                  {{ getStatusText(keyStatuses[file]).text }}
                </span>
              </div>
            </div>
          </template>
          <template v-slot:after>
            <div :style="{width: '80px'}">
              <q-btn v-show="typeof getExistingValue(file) === 'string'" @click="onShowEdit(file)" round dense flat
                     icon="edit"/>
              <q-btn round dense flat @click="translate(file)" icon="g_translate"/>
            </div>
          </template>
        </q-input>
      </q-form>
      <div style="margin-top: 30px;">
        <q-btn size="sm" color="primary" icon="add" label="New language" @click="addNewLanguage"></q-btn>
      </div>
    </div>
    <q-dialog v-model="showConfirmDeleteModel">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="red" text-color="white"/>
          <span class="q-ml-sm">Delete key <strong>{{ displayKey }}</strong>. Are you sure?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup/>
          <q-btn flat label="Yes, sure." color="primary" @click="onDeleteKey" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showChangeKeyModel">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Change to new key</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input placeholder="eg: btn.click" dense autofocus v-model="newKeyChangeModel" @keyup.enter="onChangeKey"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn flat @click="onChangeKey" label="Update"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
const fs = require('fs');
import translate from "../plugins/translate.js";
import {copyToClipboard, scroll, QSpinnerGears} from 'quasar';

export default {
  name: 'Workspace',
  data() {
    return {
      translationFilesComputeCounter: 0,
      displayKey: '',
      finalKey: '',
      suggestionIndex: null,
      suggestionList: [],
      translationModels: {},
      existingKeyValue: {},
      keyStatuses: {},
      showConfirmDeleteModel: false,
      showChangeKeyModel: false,
      newKeyChangeModel: '',
    };
  },
  computed: {
    currentKeyStatus() {
      let data = {
        disabled: false,
        onClick: () => {
          this.save()
        },
        color: 'primary',
        label: 'save',
        icon: 'save'
      }
      const statuses = Object.values(this.keyStatuses).map(status => this.getStatusText(status))
      if (statuses.some(status => [3, 4].includes(status.code))) {
        data.disabled = true
      } else if (statuses.some(status => [1, 2].includes(status.code))) {
        Object.assign(data, {
          color: 'warning',
          label: 'overwrite',
          onClick: () => {
            this.$q.dialog({
              title: 'Overwrite key',
              message: `Are you sure to overwrite on key "${this.displayKey}"?`,
              cancel: true,
              persistent: true
            }).onOk(() => {
              this.save(true)
            })
          },
        })
      }
      return data
    },
    isSnakeCase() {
      return this.displayKey.indexOf('_') > -1;
    },
    translationFiles() {
      this.translationFilesComputeCounter;
      return this.$helpers.getJsonFilesInFolder(this.config.localePath).sort((a, b) => {
        if (a === this.config.primaryLanguage) {
          return -1;
        } else if (b === this.config.primaryLanguage) {
          return 1;
        } else {
          return 0;
        }
      });
    },
    config() {
      return this.$store.getters['translate/configs'][this.$route.params.configIndex];
    },
    helpers() {
      return this.$helpers;
    },
    translations: {
      get() {
        return this.$store.state.translate.translations;
      },
      set(translations) {
        console.log(translations)
      }
    },
  },
  methods: {
    addNewLanguage() {
      this.$q.dialog({
        title: 'New translation',
        message: 'New locale code:',
        prompt: {
          model: '',
          type: 'text' // optional
        },
        cancel: true,
        persistent: false
      }).onOk(data => {
        const existingFiles = this.translationFiles.map(file => this.getLanguageCode(file))
        if (existingFiles.includes(data)) {
          this.$q.notify({
            icon: 'error',
            message: `${$helpers.getNativeLanguage(data)} already exists`
          })
          return
        } else if (!(/^[a-zA-Z\-]+$/g.test(data))) {
          this.$q.notify({
            icon: 'error',
            message: 'Invalid locale code'
          })
          return
        }
        this.generateNewLanguageFile(data)
      })
    },
    async generateNewLanguageFile(localeCode) {
      const dialog = this.$q.dialog({
        title: 'Generating...',
        dark: true,
        progress: {
          spinner: QSpinnerGears,
          color: 'amber'
        },
        persistent: true,
        ok: false
      })

      const baseTranslation = this.translations[this.config.primaryLanguage]
      const baseLanguage = this.getLanguageCode(this.config.primaryLanguage)

      let newTranslation = JSON.parse(JSON.stringify(baseTranslation))

      if (translate.languages.isSupported(localeCode)) {
        dialog.update({
          title: 'Translating...\n'
        })
        let pendingTasks = []

        function translateObjectString(obj) {
          for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (typeof (obj[key]) === 'string') {
                pendingTasks.push(((pointer, key, dialog) => async () => {
                  try {
                    let result = (await translate(pointer[key], {from: baseLanguage, to: localeCode, client: 'webapp'}))
                    dialog.update({ title: `Translating...\n(Success: ${key})` })
                    pointer[key] = result.text
                  } catch (e) {
                    dialog.update({ title: `Translating...\n(Failed: ${key})` })
                    console.error(`Failed to translate: ${key}`)
                  }
                })(obj, key, dialog))
              } else if (typeof (obj[key]) === 'object') {
                translateObjectString(obj[key])
              }
            }
          }
        }

        translateObjectString(newTranslation)
        await Promise.all(pendingTasks.map(task => task()))
      }
      fs.writeFileSync(this.config.localePath + '/' + localeCode + '.json', JSON.stringify(newTranslation, null, 2))
      await this.$store.dispatch('translate/loadTranslation', this.$route.params.configIndex);
      this.translationFilesComputeCounter++;
      dialog.hide()
    },
    existingKeys() {
      return $helpers.extractKeys(...Object.values(this.translations));
    },
    convertToCamelCase() {
      let normalized = this.$helpers.normalizeStringCase(this.displayKey);
      this.displayKey = normalized.replace(/ ./g, (m) => m.replace(/ /g, '').toUpperCase());
    },
    convertToSnakeCase() {
      let normalized = this.$helpers.normalizeStringCase(this.displayKey);
      this.displayKey = normalized.replace(/ /g, '_');
    },
    getStatusText(keyStatus) { // 0: new key, 1: old keu, 2: unavailable
      if (!keyStatus) {
        return {
          code: 4,
          text: ''
        };
      }
      if (keyStatus.isAvailable) {
        return {
          code: 0,
          text: 'Available'
        };
      } else if (keyStatus.value === null) {
        return {
          code: 3,
          text: 'Unavailable'
        };
      } else if (typeof keyStatus.value === 'string') {
        return {
          code: 1,
          text: 'Key exist'
        };
      } else if (typeof keyStatus.value === 'object') {
        return {
          code: 2,
          text: 'Parent key'
        };
      } else {
        return {
          code: 4,
          text: 'Unknown status'
        };
      }
    },
    onDeleteKey() {
      for (const file of this.translationFiles) {
        try {
          this.$store.commit('translate/deleteTranslationKey', {
            file: file, // 'en.json',
            keys: this.displayKey, // 'alert.exchange_rate_is_created',
            config: this.config
          });
        } catch (e) {
          this.$q.notify({
            icon: 'error',
            message: e.toString()
          });
        }
      }
      this.updateKeyChecker()
    },
    onChangeKey() {
      let isAvailable = (() => {
        for (const file of this.translationFiles) {
          const statuses = this.$store.getters['translate/getKeyStatuses'](this.newKeyChangeModel)
          if ([1, 2].includes(this.getStatusText(statuses[file]).code)) {
            this.$q.notify({
              icon: 'error',
              message: `The new key ${this.newKeyChangeModel} is already exist.`
            });
            return false
          } else if (this.getStatusText(statuses[file]).code !== 0) {
            this.$q.notify({
              icon: 'error',
              message: `The new key ${this.newKeyChangeModel} is not invalid.`
            });
            return false
          }
        }
        return true
      })()
      if (isAvailable) {
        console.log(`change from ${this.displayKey} to ${this.newKeyChangeModel}`)
        const values = this.getFromKey(this.displayKey)
        for (const file in values) {
          this.saveToKey(this.newKeyChangeModel, values[file], file)
          this.onDeleteKey();
        }
        this.showChangeKeyModel = false
      }
      this.updateKeyChecker()
    },
    getExistingValue(file) {
      try {
        return this.existingKeyValue[file];
      } catch (e) {
        return null;
      }
    },
    onShowEdit(file) {
      this.$set(this.translationModels, file, this.existingKeyValue[file]);
    },
    onCopy() {
      copyToClipboard(this.finalKey);
      this.$q.notify(`Copied '${this.finalKey}'`);
    },
    onInputKey() {
      const selectionPosition = this.$refs.inputKey.$refs.input.selectionStart;
      this.displayKey = this.displayKey.replace(/ /g, '_');
      this.$nextTick(() => {
        this.$refs.inputKey.$refs.input.setSelectionRange(selectionPosition, selectionPosition);
      });
      this.updateFinalKey();
    },
    updateFinalKey() {
      this.finalKey = this.displayKey;
    },
    chooseKey(keySequence) {
      this.finalKey = keySequence.join('.');
      this.$refs.inputKey.focus();
    },
    scrollToElement(el) {
      if (el) {
        const target = scroll.getScrollTarget(el)
        const offset = el.offsetLeft;
        const duration = 600;
        scroll.setHorizontalScrollPosition(target, offset, duration)
      }
    },
    getTranslateSrc(fromKeyOnly = false) {
      let translateSrc = this.$helpers.normalizeStringCase(this.finalKey.split('.').pop());
      let fromLanguage = ''; // en

      if (!fromKeyOnly && this.translationModels[this.config.primaryLanguage]) {
        translateSrc = this.translationModels[this.config.primaryLanguage];
        fromLanguage = this.config.languageCodes[this.config.primaryLanguage];
      }

      return {
        text: translateSrc,
        language: fromLanguage,
      }
    },
    async translateToLanguage(src, fileName) {
      const fromLanguage = src.language;
      const toLanguage = this.getLanguageCode(fileName);
      let result = null;

      if (this.config.primaryLanguage === fileName
        || fromLanguage === toLanguage
        || !translate.languages.isSupported(toLanguage)) {
        result = src.text; // don't forget to correct grammar here
      } else {
        result = await translate(src.text, {from: fromLanguage, to: toLanguage, client: 'webapp'});
        result = result.text
      }
      return result || '';
    },
    getLanguageCode(fileName) {
      return this.config.languageCodes[fileName] || fileName.split('.')[0];
    },
    async onKeyPressed(e) {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'u':
            this.displayKey = '';
            this.finalKey = '';
            break;
          case 'w':
            let key = this.displayKey;
            while (key.length > 0 && key[key.length - 1] !== '.') {
              key = key.substr(0, key.length - 1);
            }
            this.displayKey = key;
            this.finalKey = key;
            break;
        }
      } else if (e.altKey) {
        switch (e.key) {
          case 'Enter':
            await this.translateAll();
            break;
        }
      }
    },
    async translate(file) {
      const srcPhrase = this.getTranslateSrc()
      if (!srcPhrase.text || !srcPhrase.text.trim()) {
        return
      }
      const loading = this.$q.notify({
        group: false,
        spinner: QSpinnerGears,
        message: `Translating to ${this.$helpers.getNativeLanguage(this.getLanguageCode(file))}...`,
        timeout: 0
      })
      try {
        this.$set(this.translationModels, file, await this.translateToLanguage(srcPhrase, file));
      } catch (e) {
        this.$q.notify({
          icon: 'error',
          message: e.toString()
        });
      } finally {
        // Close notify
        loading({timeout: 1})
      }
    },
    async translateAll() {
      this.finalKey = this.displayKey;
      let src = this.getTranslateSrc(true);
      if (src.text) {
        const dialog = this.$q.dialog({
          title: 'Translating...',
          dark: true,
          progress: {
            spinner: QSpinnerGears,
            color: 'amber'
          },
          persistent: true,
          ok: false
        })

        // Error not caught properly, when one promise error, all down
        try {
          const translations = await Promise.all(this.translationFiles.map(fileName => this.translateToLanguage(src, fileName)));

          for (let i = 0; i < this.translationFiles.length; i++) {
            this.$set(this.translationModels, this.translationFiles[i], translations[i]);
          }

        } catch (e) {
          dialog.hide()
          this.$q.notify({
            icon: 'error',
            message: e.toString()
          });
        } finally {
          dialog.hide()
        }
      }
    },
    onPressTab(e) {
      e.preventDefault();
      this.suggestionList = this.existingKeys().filter(k => {
        const joinedKey = k.join('.');
        return joinedKey.startsWith(this.finalKey) && joinedKey.substr(this.finalKey.length).indexOf('.') < 0;
      });

      if (this.suggestionIndex == null) {
        this.suggestionIndex = 0;
      } else {
        Number.prototype.mod = function (n) {
          return ((this % n) + n) % n;
        };

        if (e.shiftKey) {
          this.suggestionIndex = (this.suggestionIndex - 1).mod(this.suggestionList.length);
        } else {
          this.suggestionIndex = (this.suggestionIndex + 1).mod(this.suggestionList.length);
        }
      }

      if (this.suggestionList.length > 0) {
        this.displayKey = this.suggestionList[this.suggestionIndex].join('.')
        this.$nextTick(() => {
          this.scrollToElement(this.$refs.suggestionContainer.children[this.suggestionIndex]);
        });
      }
    },
    getFromKey(key) {
      return this.$store.getters['translate/getTranslationFromKey'](key);
    },
    saveToKey(key, value, file, force = false) {
      this.$store.commit('translate/addTranslations', {
        file: file, // 'en.json',
        keys: key, // 'alert.exchange_rate_is_created',
        value: value, // 'Hi my world',
        config: this.config,
        force: force,
      });
    },
    save(force = false) {
      try {
        for (let file of this.translationFiles) {
          this.saveToKey(this.finalKey, this.translationModels[file], file, force)
        }

        this.updateKeyChecker()

        this.$q.notify({
          position: 'top-right',
          color: 'positive',
          message: `Added key "${this.displayKey}" successfully.`,
          duration: 500
        });
      } catch (e) {
        this.$q.notify({
          icon: 'error',
          message: e.toString()
        })
      }
    },
    updateWorkspace() {
      this.$store.dispatch('translate/loadTranslation', this.$route.params.configIndex);
      this.displayKey = '';
      this.finalKey = '';
      this.suggestionIndex = null;
      this.suggestionList = [];
      this.translationModels = {};
    },
    updateKeyChecker() {
      this.existingKeyValue = this.$store.getters['translate/getTranslationFromKey'](this.displayKey);
      this.keyStatuses = this.$store.getters['translate/getKeyStatuses'](this.displayKey);
    }
  },
  watch: {
    displayKey() {
      this.updateKeyChecker()
    },
    finalKey() {
      this.displayKey = this.finalKey;
      this.suggestionIndex = null;
    },
    '$route.params.configIndex'() {
      this.updateWorkspace();
    }
  },
  created() {
    this.updateWorkspace();
  }
}
</script>
