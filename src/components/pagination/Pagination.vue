<script setup lang="ts">
// @rainfall - vuejs-templates - v1.0.0
import { computed } from 'vue';
import type { Paginator } from '../../ts/Pagination';
import TaskButton from '../TaskButton.vue';


const props = defineProps<{
  paginator: Paginator
}>();

const nbPrevious = computed(() => props.paginator.current - 1)
const nbNext = computed(() => props.paginator.current + 1)

const isOnePage = computed(() => props.paginator.max == 1 || props.paginator.max == 0)
const isFirst = computed(() => props.paginator.current == 1)
const isLast = computed(() => props.paginator.current == props.paginator.max)
const deltaToFirst = computed(() => props.paginator.current - 1)
const deltaToLast = computed(() => props.paginator.max - props.paginator.current)
</script>

<template>
  <nav v-if="!isOnePage" class="pagination is-rounded" role="navigation" aria-label="pagination">
    <TaskButton :task="() => paginator.previousPage()" class="pagination-previous" :disabled="isFirst">Previous</TaskButton>
    <TaskButton :task="() => paginator.nextPage()" class="pagination-next" :disabled="isLast">Next page</TaskButton>
    <ul class="pagination-list">
      <li v-if="!isFirst"><TaskButton :task="() => paginator.firstPage()" class="pagination-link" aria-label="Goto page 1">1</TaskButton></li>
      <li v-if="!isFirst && deltaToFirst > 2"><span class="pagination-ellipsis">&hellip;</span></li>
      <li v-if="!isFirst && deltaToFirst > 1"><TaskButton :task="() => paginator.previousPage()" class="pagination-link" :aria-label="'Goto page ' + nbPrevious">{{ nbPrevious }}</TaskButton></li>
      <li>
        <button class="pagination-link is-current" :aria-label="'Page ' + paginator.current" aria-current="page">{{ paginator.current }}</button>
      </li>
      <li v-if="!isLast && deltaToLast > 1"><TaskButton :task="() => paginator.nextPage()" class="pagination-link" :aria-label="'Goto page ' + nbNext">{{ nbNext }}</TaskButton></li>
      <li v-if="!isLast && deltaToLast > 2"><span class="pagination-ellipsis">&hellip;</span></li>
      <li v-if="!isLast"><TaskButton :task="() => paginator.lastPage()" class="pagination-link" :aria-label="'Goto page ' + paginator.max">{{ paginator.max }}</TaskButton></li>
    </ul>
  </nav>
</template>