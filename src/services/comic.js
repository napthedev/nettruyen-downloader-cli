import axios from "axios";
import { parse } from "node-html-parser";

export const getComicInfo = async (comicURL) => {
  const source = (await axios.get(comicURL)).data;

  const dom = parse(source);

  if (!dom.querySelector("#item-detail .title-detail")?.textContent)
    throw new Error("404");

  const result = {
    title: dom.querySelector("#item-detail .title-detail")?.textContent,
    chapters: Array.from(
      dom.querySelectorAll(".list-chapter ul li:not(.heading)")
    )
      .map((li) => ({
        title: li.querySelector(".chapter a")?.textContent,
        url: li.querySelector(".chapter a")?.getAttribute("href"),
      }))
      .reverse(),
  };

  return result;
};
