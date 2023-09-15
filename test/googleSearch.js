import { googleSearch } from "../index.js";

console.log(
  "googleSearch:",
  await googleSearch({ query: "best michael jordan games" })
);
