import { booksModule } from './books.module'
import { booksMutations } from './books.mutations'
import { booksSelectors } from './books.selectors'

export const books = {
  ...booksModule,
  ...booksMutations,
  ...booksSelectors,
}
