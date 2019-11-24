// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { books } from './books'

console.log(
  'add single book:',
  books.addBook({
    id: '1',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    amountInStock: 100,
  }),
)

console.log('number of books:', books.numberOfBooks())

console.log(
  'add multiple books:',
  books.addBooks(
    {
      id: '2',
      title: 'The Black Company',
      author: 'Glen Cook',
      amountInStock: 20,
    },
    {
      id: '3',
      title: 'Nineteen Eighty-Four',
      author: 'George Orwell',
      amountInStock: 0,
    },
  ),
)

console.log('out of stock:', books.outOfStock())

console.log('update amount in stock:', books.setAmountInStock('3', 200))

console.log('book 3:', books.byId('3'))
