import { gotScraping as got } from "got-scraping";
import { JSDOM } from "jsdom";

import { HeaderGenerator } from "header-generator";

export const getHeaders = () => {
  const header = new HeaderGenerator().getHeaders({
    browsers: ["chrome"],
    devices: ["desktop"],
    operatingSystems: ["windows"],
  });

  return {
    accept: "*/*",
    "sec-ch-ua-mobile": header["sec-ch-ua-mobile"],
    "sec-ch-ua-platform": header["sec-ch-ua-platform"],
    "sec-ch-ua": header["sec-ch-ua"],
    "user-agent": header["user-agent"],
  };
};

export const browserInfo = async ({ options }) => {
  const headers = options?.headers || getHeaders();

  const response = await got("https://api.apify.com/v2/browser-info", {
    headers,
    ...options,
    responseType: "json",
  });

  return response.body;
};

export const googleSearch = async ({ query, options }) => {
  const start = performance.now();
  const headers = options?.headers || getHeaders();
  const sendHtml = options?.html || "false";

  delete options?.html;

  const response = await got({
    url: "https://www.google.com/search",
    searchParams: {
      q: query,
      num: 100,
    },
    headers,
    ...options,
    responseType: "text",
  });

  if (sendHtml === "true") {
    return {
      code: 200,
      status: "success",
      message: "HTML response",
      query,
      body: response.body,
    };
  }

  if (response.statusCode !== 200)
    return {
      code: response.statusCode,
      status: "error",
      message: "Captcha or too many requests.",
      query,
      body: response.body,
    };

  const dom = new JSDOM(response.body);
  const document = dom.window.document;

  const searchResults = dom.window.document.querySelectorAll(".g");

  const results = [];

  searchResults.forEach((result) => {
    const title = result.querySelector("h3");
    const url = result.querySelector("a");
    const description = result.querySelector(".VwiC3b");

    if (title && url && description) {
      results.push({
        title: title.textContent,
        url: url.href,
        description: description.textContent,
      });
    }
  });

  let snippet = {
    title:
      document.querySelector(".co8aDb")?.textContent ||
      document.querySelector(".LC20lb")?.textContent,
    description:
      document.querySelector(".hgKElc")?.textContent.trim() ||
      document
        .querySelector(".i8Z77e")
        ?.innerHTML.split("</li>")
        .filter((item) => item !== "")
        .map((item) => item.slice(item.indexOf(">") + 1))
        .join("\n") ||
      document
        .querySelector(".X5LH0c")
        ?.innerHTML.split("</li>")
        .filter((item) => item !== "")
        .map(
          (item, index) => index + 1 + ". " + item.slice(item.indexOf(">") + 1)
        )
        .join("\n"),
  };

  if (!snippet.description) snippet = null;

  return {
    code: 200,
    status: "success",
    message: `Found ${results.length} results in ${formatTime(
      (performance.now() - start) / 1000
    )}`,
    query,
    data: { snippet, results },
  };
};

export const amazonSearch = async ({ query, options }) => {
  const start = performance.now();
  const headers = options?.headers || getHeaders();
  const sendHtml = options?.html || "false";

  delete options?.html;

  const response = await got({
    url: "https://www.amazon.in/s",
    searchParams: {
      k: query,
      rh: "p_85:10440599031,p_72:1318476031",
      s: "review-rank",
    },
    headers,
    ...options,
    responseType: "text",
  });

  if (sendHtml === "true") {
    return {
      code: 200,
      status: "success",
      message: "HTML response",
      query,
      body: response.body,
    };
  }

  if (response.statusCode !== 200)
    return {
      code: response.statusCode,
      status: "error",
      message: "Captcha or too many requests.",
      query,
      body: response.body,
    };

  const dom = new JSDOM(response.body);

  const searchResults = dom.window.document.querySelectorAll(".s-result-item");
  let results = [];

  searchResults.forEach((result) => {
    const image = result.querySelector(".s-image")?.src;
    const title = result.querySelector("h2")?.textContent;
    let rating = result.querySelector(".a-icon-alt")?.textContent.split(" ")[0];
    let reviews = result.querySelector(
      ".a-size-base.s-underline-text"
    )?.textContent;
    let price = result.querySelector(".a-price-whole")?.textContent;

    if (title && rating && reviews && price) {
      rating = Number(rating);
      reviews = Number(reviews.replaceAll(",", ""));
      price = Number(price.replaceAll(",", ""));

      let factor = 0;
      let gmt = rating / reviews;
      if (rating === 4.9) factor = 10;
      else if (rating === 4.8) factor = 20;
      else if (rating === 4.7) factor = 30;
      else if (rating === 4.6) factor = 40;
      else if (rating === 4.5) factor = 50;
      else if (rating === 4.4) factor = 60;
      else if (rating === 4.3) factor = 70;
      else if (rating === 4.2) factor = 80;
      else if (rating === 4.1) factor = 90;
      else if (rating === 4.0) factor = 100;
      factor *= 10;

      gmt = gmt + (gmt * factor) / 100;

      results.push({
        image,
        title,
        rating,
        reviews,
        price,
        gmt,
      });
    }
  });

  results = results
    .sort((a, b) => a.gmt - b.gmt)
    .filter((item) => typeof item.gmt === "number");

  return {
    code: 200,
    status: "success",
    message: `Found ${results.length} results in ${formatTime(
      (performance.now() - start) / 1000
    )}`,
    query,
    data: { results },
  };
};

const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - hours * 3600) / 60);
  const seconds = Math.floor(time - hours * 3600 - minutes * 60);
  if (hours === 0 && minutes === 0) return `${seconds}s`;
  if (hours === 0) return `${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
};
