<template>
  <div>
    <q-input
      filled
      autofocus
      ref="inputKey"
      @keydown.ctrl.c="!$q.platform.is.mac ? onCopy : null"
      @keydown.meta.c="$q.platform.is.mac ? onCopy : null"
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
  </div>
</template>

<script>
  export default {
    name: 'TranslationKeyInput',
    props: {
      onCopy: Function,
      onKeyPressed: Function,
      onPressTab: Function,
      onInputKey: Function,
      updateFinalKey: Function,
      displayKey: Function,
      translateAll: Function,
    }
  }
</script>
