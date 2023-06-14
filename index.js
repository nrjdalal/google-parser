import { gotScraping } from 'got-scraping'

export const browserInfo = async () => {
  const response = await gotScraping({
    url: 'https://api.apify.com/v2/browser-info',
    responseType: 'json',
  })

  return response.body
}
