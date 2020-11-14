// import something here

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default async ({ app, router, store, Vue}) => {
  store.dispatch('translate/loadConfigs')
  store.dispatch('translate/loadGoogleTranslateCookie')
}
