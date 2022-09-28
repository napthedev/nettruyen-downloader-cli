import axios from "axios";
import { parse } from "node-html-parser";

import { urlWithProxy } from "../utils/url.js";

export const getComicInfo = async (comicURL: string) => {
  const source = (await axios.get(urlWithProxy(comicURL))).data;

  const dom = parse(source);

  if (!dom.querySelector("#item-detail .title-detail")?.textContent)
    throw new Error("404");

  const result = {
    title: dom.querySelector("#item-detail .title-detail")?.textContent,
    chapters: Array.from(
      dom.querySelectorAll(".list-chapter ul li:not(.heading)")
    )
      .map((li) => {
        const title = li.querySelector(".chapter a")?.textContent;
        const url = li.querySelector(".chapter a")?.getAttribute("href");
        if (!title || !url) {
          throw new Error("404");
        }
        return {
          title,
          url,
          images: [] as (string | undefined)[],
        };
      })
      .reverse(),
  };

  return result;
};
