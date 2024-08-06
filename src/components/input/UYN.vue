<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0
const model = defineModel();
const props = defineProps<{
  label: string,
}>();
</script>

<template>
  <div class="field is-grouped">
    <label class="label control">{{ props.label }}</label>
    <div class="control select" v-bind="$attrs">
      <select v-model="model">
        <option :value="undefined" selected>Unknown</option>
        <option :value="true">Yes</option>
        <option :value="false">No</option>
      </select>
    </div>
  </div>
</template>