<template>
  <q-page padding>
    <q-btn @click="test">Click here</q-btn>
    {{translations}}
  </q-page>
</template>

<script>
const fs = require('fs');

export default {
  name: 'Workspace',
  computed: {
    translations: {
      get() {
        return this.$store.state.translate.translations;
      },
      set(translations) {
        console.log(translations)
      }
    }
  },
  methods: {
    test() {
      this.$store.commit('translate/updateTranslations', {file: 'en.json', keys: 'alert', value: 'Hi my world', force: true});
    }
  },
  created() {
    this.$store.dispatch('translate/loadTranslation', this.$route.params.configIndex);
  }
}
</script>
