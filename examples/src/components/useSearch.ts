import { ref } from 'vue'

const search = ref('')
export function useSearch() {
  return { search }
}