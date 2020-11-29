<template>
<div class="pa4">
      <input type="text" v-model="search">

  <div class="grid">
    <BookList /> 
    <BookList /> 
  </div>
</div>
</template>

<script lang="ts">
import BookList from './components/BookList.vue'
import { ref } from 'vue'
import { useSearch } from './components/useSearch'
export default {
  components: {
    BookList
  },
  setup() {
    const { search } = useSearch()
    return { search }
  }
}
</script>

<style lang="postcss" scoped>
.grid {
  display: grid;
  grid-auto-flow: column;
  grid-gap: 30px;
  grid-template-columns: repeat(2, 1fr);
}

.area-1 {
  grid-column: 1/span 1;
  grid-row-start: auto;
}
.area-2 {
  grid-column: 2/span 1;
    grid-row-start: auto;

}
.area-3 {
  grid-column: 3/span 1;
    grid-row-start: auto;

}
.area-4 {
  grid-column: 4/span 1;
    grid-row-start: auto;

}
.area-5 {
  grid-column: 5/span 1;
    grid-row-start: auto;

}
</style>
