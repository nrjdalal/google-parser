import { getHeaders, googleSearch } from '@nrjdalal/google-parser'

const headers = getHeaders()

console.log(await googleSearch({ query: 'apple', options: { headers } }))
console.log(await googleSearch({ query: 'microsoft', options: { headers } }))
