import { gotScraping } from 'got-scraping'
import { JSDOM } from 'jsdom'

const headers = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.5',
  'Alt-Used': 'www.google.com',
  Connection: 'keep-alive',
  Referer: 'https://www.google.com/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
}

export const browserInfo = async () => {
  const response = await gotScraping({
    url: 'https://api.apify.com/v2/browser-info',
    headers,
    headerGeneratorOptions: {
      devices: ['desktop'],
      locales: ['en-US'],
    },
    responseType: 'json',
  })

  return response.body
}

export const googleSearch = async ({ query }) => {
  const start = performance.now()

  const response = await gotScraping({
    url: 'https://www.google.com/search',
    searchParams: {
      q: query,
      num: 100,
    },
    headers,
    responseType: 'text',
  })

  if (response.statusCode !== 200)
    return {
      code: response.statusCode,
      status: 'error',
      message: 'Captcha or too many requests.',
    }

  const dom = new JSDOM(response.body)

  const searchResults = dom.window.document.querySelectorAll('.g')

  const results = []

  searchResults.forEach((result) => {
    const title = result.querySelector('h3').textContent
    const url = result.querySelector('a').href
    const description = result.querySelector('.VwiC3b')

    if (title && url && description) {
      results.push({
        title,
        url,
        description: description.textContent,
      })
    }
  })

  return {
    code: 200,
    status: 'success',
    message: `Found ${results.length} results in ${formatTime(
      (performance.now() - start) / 1000
    )}`,
    data: { results },
  }
}

const formatTime = (time) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - hours * 3600) / 60)
  const seconds = Math.floor(time - hours * 3600 - minutes * 60)
  if (hours === 0 && minutes === 0) return `${seconds}s`
  if (hours === 0) return `${minutes}m ${seconds}s`
  return `${hours}h ${minutes}m ${seconds}s`
}
