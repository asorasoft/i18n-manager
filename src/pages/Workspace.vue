<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-form class="q-gutter-md">
        <div class="row">
          <q-btn class="q-mr-sm" size="sm" color="red" icon="delete" label="delete"></q-btn>
          <q-btn size="sm" color="warning" icon="edit" label="change key"></q-btn>
        </div>
        <q-input
          filled
          ref="inputKey"
          @keydown.tab="onPressTab"
          @input="updateFinalKey"
          v-model="displayKey"
        >
          <template v-slot:after>
            <q-btn round dense flat icon="content_copy" />
          </template>
        </q-input>
        <q-scroll-area
          horizontal
          :vertical="false"
          :style="{
            height: '60px'
          }"
        >
        <div class="row no-wrap">
          <q-chip clickable @click="choosekey(suggestion)" class="q-ma-sm" v-for="suggestion in suggestionList" :key="suggestion[suggestion.length -1]">
            {{suggestion[suggestion.length -1]}}
          </q-chip>
        </div>
        </q-scroll-area>
      </q-form>
    </div>
  </q-page>
</template>

<script>
const fs = require('fs');

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
    }
  },
  methods: {
    updateFinalKey() {
      this.finalKey = this.displayKey;
    },
    choosekey(keySequence) {
      this.finalKey = keySequence.join('.');
      this.$refs.inputKey.focus();
    },
    onPressTab(e) {
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

      console.log(this.suggestionIndex);

      e.preventDefault();
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
    },
  },
  watch: {
    finalKey() {
      this.displayKey = this.finalKey;
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
