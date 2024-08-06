<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0

/* Message to display when no data is available and we want to guide the user to do something (create new data, start a process...) */

defineProps<{
  icon?: string,
}>();

</script>

<template>
<div class="container has-text-centered">
  <span v-if="icon" class="icon m-4" style="font-size: 3em;">
    <i :class="'bi bi-' + icon"></i>
  </span>
  <h4 class="title mt-3 mb-2">
    <slot name="title"></slot>
  </h4>
  <div class="has-text-grey">
    <slot></slot>
  </div>
  <div class="mt-5">
    <slot name="actions"></slot>
  </div>
</div>
</template>