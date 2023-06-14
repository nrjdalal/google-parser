import { gotScraping } from 'got-scraping'
import { JSDOM } from 'jsdom'

export const browserInfo = async () => {
  const response = await gotScraping({
    url: 'https://api.apify.com/v2/browser-info',
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
    responseType: 'text',
  })

  const dom = new JSDOM(response.body)

  const searchResults = dom.window.document.querySelectorAll('.g')

  const results = []

  searchResults.forEach((result) => {
    const title = result.querySelector('h3').textContent
    const link = result.querySelector('a').href
    const description = result.querySelector('.VwiC3b')

    if (title && link && description) {
      results.push({
        title,
        link,
        description: description.textContent,
      })
    }
  })

  return {
    status: 'success',
    message: `Found ${results.length} results in ${formatTime(
      (performance.now() - start) / 1000
    )}`,
    data: { resultsLength: results.length, results },
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
