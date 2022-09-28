import axios from "axios";
import { parse } from "node-html-parser";

import type { ImageType } from "../shared/types.js";
import { urlWithProxy } from "../utils/url.js";

export const getChapImages = async (url: string): Promise<ImageType[]> => {
  const source = (await axios.get(urlWithProxy(url))).data;

  const dom = parse(source);

  if (!dom.querySelector(".box_doc")) throw new Error("404");

  return Array.from(dom.querySelectorAll(".box_doc img")).map((img) =>
    img.getAttribute("src")?.startsWith("//")
      ? img.getAttribute("src")?.replace("//", "http://")
      : img.getAttribute("src")
  );
};
