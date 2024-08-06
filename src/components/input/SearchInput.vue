<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0
const search_field = defineModel();
</script>

<template>
  <div class="field">
    <p class="control has-icons-right has-icons-right">
      <input name="search" class="input" type="text" v-model="search_field" v-bind="$attrs">
      <span v-if="search_field" class="icon is-small is-right" style="cursor: pointer; pointer-events: initial;" @click="search_field = ''">
        <i class="bi bi-x-circle"></i>
      </span>
    </p>
  </div>
</template>