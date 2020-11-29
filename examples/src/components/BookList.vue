<template>
  <div>
    <ul>
      <li v-for="book in books" :key="book.title">{{ book.title }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import { useBooks } from './useBooks'
import { useSearch } from './useSearch'

export default {
  props: {
    id: {
      type: String,
    }
  },
  setup(props) {
    const { search } = useSearch()
    const { books } = useBooks(search)
    return {
      books 
    }
  }
}
</script>
