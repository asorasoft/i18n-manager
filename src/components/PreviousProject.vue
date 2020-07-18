<template>
  <q-item clickable>
    <q-item-section avatar>
      <q-icon name="history"/>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ config.projectName }}</q-item-label>
      <q-item-label caption>
        {{ config.localePath }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

