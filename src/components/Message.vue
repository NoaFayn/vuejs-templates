<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0
withDefaults(defineProps<{
  type?: string
}>(), {
  type: 'danger'
})

</script>

<template>
  <article :class="'message is-' + type">
    <div class="message-body">
      <slot></slot>
    </div>
  </article>
</template>