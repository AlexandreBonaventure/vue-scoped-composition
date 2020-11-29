# Vue Scoped Composition

Delightful & simple state management for Vue.
Shared state & subscription management leveraging the composition API.

Features:
- Global state wihout tools like Vuex
- Lightweight
- Powerful composable patterns  

## Usage 

```js
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
```


With the composition API, state management got easier and sharing state between components does not require necessarily tools like VueX. This library provide a simple way to deal with common use-cases when you need a global store.

## How it works
TODO

## API
TODO
