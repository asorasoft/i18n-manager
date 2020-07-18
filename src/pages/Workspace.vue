<template>
  <q-page padding>
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
      // this.$store.commit('translate/updateTranslations', {file: 'en.json', keys: 'alert.exchange_rate_is_created', value: 'Hi my world', force: true});
      // console.log(this.$store.getters['translate/getTranslationFromKey']('alert.exchange_rate_is_created'));
    }
  },
  created() {
    this.$store.dispatch('translate/loadTranslation', this.$route.params.configIndex);
  }
}
</script>
