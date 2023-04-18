# I18n (i18n)

GUI for managing translation

## Auto build
```bash
sudo bash build.sh
```

---

## Install the dependencies
This requires nodejs 16
```bash
npm install
npm install -g @quasar/cli
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```

### Build the app for production
```bash
quasar build -m electron
```
See more [here](https://quasar.dev/quasar-cli/developing-electron-apps/build-commands)

#### Build on MacOS ARM
```
quasar build -m electron --platform=darwin --arch=arm64 --osx-sign=true
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
