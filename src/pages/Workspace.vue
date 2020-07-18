<template>
  <q-page padding>
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
          ref="inputKey"
          @keypress="onKeyPressed"
          @keydown.tab="onPressTab"
          @input="updateFinalKey"
          @blur="updateFinalKey"
          v-model="displayKey"
          hint="Translation key"
        >
          <template v-slot:after>
            <q-btn @click="onCopy" round dense flat icon="content_copy" />
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

        <q-input v-for="file in translationFiles" :key="file" filled>
          <template v-slot:before>
            <span :style="{fontSize: '14px'}">{{file.split('.')[0].toUpperCase()}}</span>
          </template>
        </q-input>
      </q-form>
    </div>
  </q-page>
</template>

<script>
const fs = require('fs');
import { copyToClipboard, scroll } from 'quasar';

export default {
  name: 'Workspace',
  data() {
    return {
      displayKey: '',
      finalKey: '',
      suggestionIndex: null,
      suggestionList: [],
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
    onCopy () {
      copyToClipboard(this.finalKey);
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
    onKeyPressed(e) {
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
          case 'a':
            this.$refs.displayKey.setSelectionRange(0, 0);
            break;
          case 'e':
            this.$refs.displayKey.setSelectionRange(this.displayKey.length, this.displayKey.length);
            break;
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
    },
  },
  watch: {
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
