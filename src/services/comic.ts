import axios from "axios";
import { parse } from "node-html-parser";

import type { ChapterType, ImageType } from "../shared/types.js";
import { urlWithProxy } from "../utils/url.js";

export interface ComicInfo {
  title: string | undefined;
  chapters: ChapterType[];
}

export const getComicInfo = async (comicURL: string): Promise<ComicInfo> => {
  const source = (await axios.get<string>(urlWithProxy(comicURL))).data;

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
          images: [] as ImageType[],
        };
      })
      .reverse(),
  };
  return result;
};
