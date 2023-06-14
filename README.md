## Installation

```bash
npm install @nrjdalal/google-parser
```

## Usage

### 1. Browser Info

Usage:

```js
import { browserInfo } from '@nrjdalal/google-parser'

const response = await browserInfo()
```

Response:

```js
{
  method: 'GET',
  // IP address of the client
  clientIp: '182.69.180.111',
  // country code of the client
  countryCode: 'US',
  bodyLength: 0,
  headers: {
    // IP address of the client
    'x-forwarded-for': '182.69.180.111',
    'x-forwarded-proto': 'https',
    'x-forwarded-port': '443',
    host: 'api.apify.com',
    // random user agent client hint
    'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    // devices: ['Desktop']
    'sec-ch-ua-mobile': '?0',
    // operatingSystems: ['windows', 'linux', 'macos']
    'sec-ch-ua-platform': '"macOS"',
    'upgrade-insecure-requests': '1',
    // random user agent
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    accept: '*/*',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'empty',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.5',
    'alt-used': 'www.google.com',
    referer: 'https://www.google.com/'
  }
}
```

### 2. Google Search

Usage:

```js
import { googleSearch } from '@nrjdalal/google-parser'

const response = await googleSearch({ query: '@nrjdalal' })
```

Output:

```js
{
  status: 'success',
  message: 'Found 5 results in 1s',
  data: {
    resultsLength: 5,
    results: [
      {
        title: 'Neeraj Dalal nrjdalal',
        link: 'https://github.com/nrjdalal',
        description: 'Web Developer & Digital Strategist. Follow their code on GitHub.',
        ...
      }
    ]
  }
}
```
