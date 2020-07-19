<template>
  <q-page :key="$route.params.configIndex" padding>
    <div class="q-pa-md">
      <q-form class="q-gutter-md">
        <div class="row" :style="{height: '25.72px'}">
          <div v-show="existingKeys.map(k => k.join('.')).includes(displayKey)">
            <q-btn class="q-mr-sm" size="sm" color="red" icon="delete" label="delete"></q-btn>
            <q-btn size="sm" color="warning" icon="edit" label="change key"></q-btn>
          </div>
        </div>
        <q-input
          filled
          autofocus
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
          <template v-slot:after>
            <div :style="{width: '80px'}">
              <q-btn v-show="true" @click="onCopy" round dense flat icon="content_copy">
                <q-tooltip>
                  Copy current key ({{$q.platform.is.mac ? 'CMD' : 'Ctrl'}} + C)
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
            @click="choosekey(suggestion)"
            class="q-ma-sm"
            v-for="(suggestion, index) in suggestionList"
            :key="suggestion[suggestion.length -1]">
            {{suggestion[suggestion.length -1]}}
          </q-chip>
        </div>
        </q-scroll-area>

        <q-input type="textarea" v-for="file in translationFiles" :key="file" filled v-model="translationModels[file]">
          <template v-slot:before>
            <div :style="{width: '50px'}">
              <span :style="{fontSize: '14px'}">{{file.split('.')[0].toUpperCase()}}</span>
            </div>
          </template>
          <template v-slot:after>
            <div :style="{width: '80px'}">
              <q-btn v-show="typeof getExistingValue(file) === 'string'" @click="onShowEdit(file)" round dense flat icon="edit" />
              <q-btn round dense flat @click="translate(file)" icon="g_translate" />
            </div>
          </template>
        </q-input>
      </q-form>
    </div>
  </q-page>
</template>

<script>
const fs = require('fs');
const translate = require('@vitalets/google-translate-api');
import { copyToClipboard, scroll } from 'quasar';

export default {
  name: 'Workspace',
  data() {
    return {
      displayKey: '',
      finalKey: '',
      suggestionIndex: null,
      suggestionList: [],
      translationModels: {},
      existingKeyValue: {},
    };
  },
  computed: {
    translationFiles() {
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
    valueFromKey() {
      return this.$store.getters['translate/getTranslationFromKey'](this.displayKey);
    },
    helpers () {
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
    existingKeys() {
      return $helpers.extractKeys(...Object.values(this.translations));
    },
  },
  methods: {
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
    onCopy () {
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
    updateFinalKey () {
      this.finalKey = this.displayKey;
    },
    choosekey(keySequence) {
      this.finalKey = keySequence.join('.');
      this.$refs.inputKey.focus();
    },
    scrollToElement (el) {
      if (el) {
        const target = scroll.getScrollTarget(el)
        const offset = el.offsetLeft;
        const duration = 600;
        scroll.setHorizontalScrollPosition(target, offset, duration)
      }
    },
    getTranslateSrc(fromKeyOnly = false) {
      let translateSrc = this.$helpers.normalizeStringCase(this.finalKey.split('.').pop());
      let fromLanguage = 'en';

      if (!fromKeyOnly && !translateSrc) {
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

      if (this.config.primaryLanguage === fileName && fromLanguage === toLanguage) {
        result = {text: src.text}; // don't forget to correct grammar here
      } else {
        result = await translate(src.text, { from: fromLanguage, to: toLanguage, client: 'webapp' });
      }
      console.log(result);
      return result != null ? result.text : '';
    },
    getLanguageCode (fileName) {
      return this.config.languageCodes[fileName] || fileName.split('.')[0];
    },
    async onKeyPressed(e) {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'u':
            this.displayKey = '';
            break;
          case 'w':
            let key = this.displayKey;
            while (key.length > 0 && key[key.length - 1] !== '.') {
              key = key.substr(0, key.length - 1);
            }
            this.displayKey = key;
            break;
        }
      } else if (e.altKey) {
        switch (e.key) {
          case 'Enter':
            this.translateAll();
            break;
        }
      }
    },
    async translate (file) {
      try {
        this.$set(this.translationModels, file, await this.translateToLanguage(this.getTranslateSrc(), file));
      } catch (e) {
        this.$q.notify(e.toString());
      }
    },
    async translateAll() {
      this.finalKey = this.displayKey;
      let src = this.getTranslateSrc(true);
      if (src.text) {
        try {
          const translations = await Promise.all(this.translationFiles.map(fileName => this.translateToLanguage(src, fileName)));

          for (let i = 0; i < this.translationFiles.length; i++) {
            this.$set(this.translationModels, this.translationFiles[i], translations[i]);
          }
        } catch (e) {
          this.$q.notify(e.toString());
        }
      }
    },
    onPressTab(e) {
      e.preventDefault();
      this.suggestionList = this.existingKeys.filter(k => {
        const joinedKey = k.join('.');
        return joinedKey.startsWith(this.finalKey) && joinedKey.substr(this.finalKey.length).indexOf('.') < 0;
      });

      if (this.suggestionIndex == null) {
        this.suggestionIndex = 0;
      } else {
        Number.prototype.mod = function(n) { return ((this%n)+n)%n; };

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
      this.$store.commit('translate/updateTranslations', {
        file: file, // 'en.json',
        keys: key, // 'alert.exchange_rate_is_created',
        value: value, // 'Hi my world',
        force: force,
      });
    },
    updateWorkspace() {
      this.$store.dispatch('translate/loadTranslation', this.$route.params.configIndex);
      this.displayKey = '';
      this.finalKey = '';
      this.suggestionIndex = null;
      this.suggestionList = [];
      this.translationModels = {};
    },
  },
  watch: {
    displayKey() {
      this.existingKeyValue = this.$store.getters['translate/getTranslationFromKey'](this.displayKey);
    },
    finalKey() {
      this.displayKey = this.finalKey;
      this.suggestionIndex = null;
    },
    '$route.params.configIndex'() {
      this.updateWorkspace();
    }
  },
  created () {
    this.updateWorkspace();
  }
}
</script>
