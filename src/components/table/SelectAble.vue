<script setup lang="ts">
// @rainfall - vuejs-templates - v1.1.1
// A table with selectable rows
// ---
// The renderer is the Vue component that takes an "element" prop and renders the element as a list of <td> HTML elements.
// The slot #thead should be filled with the table header
// Elements can be anything
import { computed, ref, watch, type Component } from 'vue';

type Element = any;

interface Header {
  name: string,
  sortValue: ((element: Element) => any) | null,
}

const props = withDefaults(defineProps<{
  renderer: Component,
  headers?: Header[],
  data: Element[],
}>(), {
  headers: () => [],
});

const emits = defineEmits<{
  (e: 'selectionUpdate', selection: Element[]): void,
}>();

let elements = ref(props.data.map((elt) => ({ value: elt, selected: false })));

watch(() => props.data, (newData) => {
  elements.value = newData.map((elt) => ({ value: elt, selected: false }));
  selectionUpdate();
});

const sortKey = ref<(element: Element) => any>(() => 0)
/**
 * Sort order, 1 for ascending, -1 for descending
 */
const sortOrder = ref(1)
const sortedElements = computed(() => elements.value.sort((a, b) => {
  const result = sortKey.value(a.value) < sortKey.value(b.value) ? -1 : sortKey.value(a.value) > sortKey.value(b.value) ? 1 : 0
  return result * sortOrder.value
}))

function sortElements(func: (e: Element) => any) {
  if (sortKey.value === func) {
    sortOrder.value = sortOrder.value * -1
  } else {
    sortKey.value = func
    sortOrder.value = 1
  }
}

function toggleSelectionForAll(event: MouseEvent) {
  if (event.target === null) return;
  let elt = (event.target as HTMLInputElement);
  if (elt.checked) {
    elements.value.forEach(elt => elt.selected = true);
  } else {
    elements.value.forEach(elt => elt.selected = false);
  }
  selectionUpdate();
}

function selectionUpdate() {
  const selection = elements.value.filter(elt => elt.selected).map(elt => elt.value);
  emits('selectionUpdate', selection);
}
</script>

<template>
  <table class="table" v-bind="$attrs">
    <thead>
      <tr>
        <th><label class="checkbox"><input @click="toggleSelectionForAll($event)" type="checkbox"></label></th>
        <th v-for="header in headers">
          <button v-if="header.sortValue" @click="sortElements(header.sortValue)">
            <b>{{ header.name }}</b>
            <span v-if="sortKey === header.sortValue" class="icon">
              <i v-if="sortOrder === 1" class="bi bi-caret-up-fill"></i>
              <i v-else class="bi bi-caret-down-fill"></i>
            </span>
          </button>
          <b v-else>{{ header.name }}</b>
        </th>
        <slot name="thead"></slot>
      </tr>
    </thead>
    <tbody>
      <tr v-for="element in sortedElements">
        <td><label class="checkbox"><input @change="selectionUpdate" type="checkbox" v-model="element.selected"></label>
        </td>
        <component :is="props.renderer" :element="element.value"></component>
      </tr>
    </tbody>
  </table>
</template>