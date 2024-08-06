<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0
import { ref } from 'vue';

const props = defineProps<{
  task: () => Promise<any>,
  isDisabled?: boolean,
}>();

const isLoading = ref(false);

function runTask() {
  isLoading.value = true;
  props.task().finally(() => isLoading.value = false);
}
</script>

<template>
  <button :disabled="isLoading || props.isDisabled" :class="{'is-loading': isLoading}" @click="runTask()">
    <slot></slot>
  </button>
</template>
