import { amazonSearch } from "../index.js";

console.log(
  "amazonSearch:",
  await amazonSearch({
    query: "router",
  })
);
