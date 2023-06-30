import { gotScraping as got } from 'got-scraping'
import { JSDOM } from 'jsdom'

import { HeaderGenerator } from 'header-generator'

export const getHeaders = () => {
  const header = new HeaderGenerator().getHeaders({
    browsers: ['chrome'],
    devices: ['desktop'],
    operatingSystems: ['windows'],
  })

  return {
    accept: '*/*',
    'sec-ch-ua-mobile': header['sec-ch-ua-mobile'],
    'sec-ch-ua-platform': header['sec-ch-ua-platform'],
    'sec-ch-ua': header['sec-ch-ua'],
    'user-agent': header['user-agent'],
  }
}

export const browserInfo = async ({ options }) => {
  const headers = options?.headers || getHeaders()

  const response = await got('https://api.apify.com/v2/browser-info', {
    headers,
    ...options,
    responseType: 'json',
  })

  return response.body
}

export const googleSearch = async ({ query, options }) => {
  const start = performance.now()
  const headers = options?.headers || getHeaders()
  const sendHtml = options?.html || 'false'

  const response = await got({
    url: 'https://www.google.com/search',
    searchParams: {
      q: encodeURIComponent(query),
      num: 100,
    },
    headers,
    ...options,
    responseType: 'text',
  })

  if (sendHtml === 'true') {
    return {
      code: 200,
      status: 'success',
      message: 'HTML response',
      query,
      body: response.body,
    }
  }

  if (response.statusCode !== 200)
    return {
      code: response.statusCode,
      status: 'error',
      message: 'Captcha or too many requests.',
      query,
      body: response.body,
    }

  const dom = new JSDOM(response.body)

  const searchResults = dom.window.document.querySelectorAll('.g')

  const results = []

  searchResults.forEach((result) => {
    const title = result.querySelector('h3')
    const url = result.querySelector('a')
    const description = result.querySelector('.VwiC3b')

    if (title && url && description) {
      results.push({
        title: title.textContent,
        url: url.href,
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
    query,
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
