<template>
  <div class="q-pa-md">
    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        filled
        label="Project name"
        v-model="projectName"
        hint="Name of project"
      ></q-input>
      <q-input
        filled
        label="Absolute path"
        v-model="absolutePath"
        hint="Translation absolute path"
      ></q-input>
      <q-btn
        @click="pickFolder"
      >
        Pick project folder
      </q-btn>
      <q-input
        filled
        label="Default language (en)"
        v-model="defaultLanguage"
        hint="Will use this from auto translation"
      ></q-input>

      <div>
        <q-btn label="Submit" type="submit" color="primary"/>
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
        absolutePath: '',
        defaultLanguage: ''
      }
    },
    methods: {
      async pickFolder() {
        let result = await electron.remote.dialog.showOpenDialog({
          properties: ['openDirectory']
        });
        if (!result.canceled) {
          this.absolutePath = result.filePaths[0];
        }
      },
      onReset() {
        this.projectName = '';
        this.absolutePath = '';
        this.defaultLanguage = '';
      },
      onSubmit() {

      }
    }
  }
</script>
