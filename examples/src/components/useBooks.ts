import scopedComposition from 'vue-scoped-composition'
import { ref, computed } from 'vue'

const { useScopedState } = scopedComposition(({ search }, { onTrigger }) => {
  const books = ref([])
  onTrigger(async () => {
    if (!search) return
    const resp = await fetch('http://openlibrary.org/search.json?limit=10&q='+search)
    const { docs } = await resp.json()
    books.value = docs
  })
  return {
    books
  }
})

export function useBooks(search) {
    return useScopedState(computed(() => ({ search: search.value })))
}