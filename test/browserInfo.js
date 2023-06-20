import { browserInfo, getHeaders } from '../index.js'

console.log(
  'browserInfo:',
  await browserInfo({ options: { headers: getHeaders() } })
)

console.log(
  'browserInfo:',
  await browserInfo({ options: { headers: getHeaders() } })
)
